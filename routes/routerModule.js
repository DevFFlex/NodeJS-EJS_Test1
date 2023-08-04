const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../file/database')
const process = require('../file/process')

const info_name = ['Line Number','Location','From','To','DrawingNumber','Service','Material','Inservice Date','Pipe size',
    'Original Thickness','Stress','Joint Efficiency','Ca','Design Life','Design Pressure','Operating Pressure','Design Temperature','Operating Temperature']

const info_type = ['text','text','text','text','text','text','text','date','number'
,'number','number','number','number','number','number','number','number','number']

const cml_name = ['CML Description']
const cml_type = ['text']

const tp_name = ['TP Description','Note']
const tp_type = ['number','text']

const tn_name = ['Inspection Date','Actual Thickness']
const tn_type = []


router.get('/',(req,res)=>{
    db.getInfoAll().then((ddd)=>{

        res.render('info.ejs',{datalist:ddd})
        
    })

    
})
router.get('/addPage',(req,res)=>{
    const table_name = req.query.table_name
    console.log(table_name)

    if(table_name === 'info'){
        res.render('addPage.ejs',{
            header:'info',
            header_name:"Add Piping",
            namelist:info_name,
            typelist:info_type
        })
    }else if(table_name === 'cml'){
        res.render('addPage.ejs',{
            header:'cml',
            header_name:"Add CML",
            namelist:cml_name,
            typelist:cml_type
        })
    }else if(table_name === 'tp'){
        res.render('addPage.ejs',{
            header:'tn',
            header_name:"Add Test Point",
            namelist:tp_name,
            typelist:tp_type
        })
    }else if(table_name === 'tn'){
        res.render('addPage.ejs',{
            header:'tn',
            header_name:"Add Thickness",
            namelist:tn_name,
            typelist:tn_type,
            
        })
    }else{
        res.send('No Page')
    }

    
})
router.get('/pipingInfo/:id',(req,res)=>{

    const line_number = req.params.id

    db.getInfo(line_number).then((obj)=>{
        const objList = [
            obj.line_number,obj.location,obj.from,obj.to,obj.drawing_number,
            obj.service,obj.material,obj.inservice_date,obj.pipe_size,obj.original_thickness,
            obj.stress,obj.joint_efficiency,obj.ca,obj.design_life,obj.design_pressure,
            obj.operating_pressure,obj.design_temperature,obj.operating_temperature
            
        ]
        
        res.render('piping_info.ejs',{
            info_name:info_name,
            info_type:info_type,
            objList:objList
        })
    })
})
router.get('/pipingDetails',(req,res)=>{
    const line_number = req.query.line_number
    const cml_number = req.query.cml_number 
    const tp_number = req.query.tp_number

    console.log(`${line_number}\t${cml_number}\t${tp_number}`)

    db.getCMLAll(line_number).then((cml_data)=>{

        console.log("getCML")

        return new Promise((resolve,reject)=>{
            db.getTPAll(line_number,cml_number).then((tp_data)=>{
                resolve([cml_data,tp_data])
            })
        })

    }).then(([cml_data,tp_data])=>{
        
        console.log(tp_data)

        res.render('piping_details.ejs',{
            line_number:line_number,
            cml_number:cml_number,
            tp_number:tp_number,
            cmlList:cml_data,
            tpList:tp_data
    
        })
    })



    
})



//------------------------------------- DB --------------------------


router.post('/insertInfo',(req,res)=>{
    const data = req.body

    db.insertInfo(data.data)
    res.send('{box:"Hello World"}')
})

router.post('/insertCML',(req,res)=>{
    const data = req.body
    var cmlList_client = data.data
    console.log(cmlList_client.length)

    db.getInfo(data.data[0]).then((row)=>{
        console.log(row.pipe_size)
        
        var actual_outside_diameter = process.actualOutsideDiameter_Cal(row.pipe_size)
        var design_thickness = process.designThickness_Cal(row.design_pressure,actual_outside_diameter,row.stress,row.joint_efficiency)
        var structural_thickness = process.structuralThickness_Cal()
        var required_thickness = process.requiredThickness_Cal(design_thickness,structural_thickness)

        console.log(`aod = ${actual_outside_diameter}\ndt = ${design_thickness}\nst = ${structural_thickness}\nrt = ${required_thickness}`)

        cmlList_client.push(actual_outside_diameter)
        cmlList_client.push(design_thickness)
        cmlList_client.push(structural_thickness)
        cmlList_client.push(required_thickness)

        console.log(cmlList_client)

        db.insertCML(cmlList_client)
    })

    // db.insertCML(data.data)
    res.send('{box:"Hello World"}')
})

router.post('/insertTP',(req,res)=>{
    const data = req.body.data

    data[1] = parseInt(data[1])
    data[2] = parseInt(data[2])

    db.insertTP(data)
    res.send('{box:"Hello World"}')
})

router.post('/insertTN',(req,res)=>{
    const data = req.body

    console.log(data)

    // db.insertCML(data.data)
    res.send('{box:"Hello World"}')
})




router.post('/deleteInfo',(req,res)=>{
    const line_number = req.body.line_number
    console.log(typeof line_number)
    db.deleteInfo(line_number)
    db.deleteCMLAll(line_number)
})

router.post('/deleteCML',(req,res)=>{
    const data = req.body
    console.log(data)

    db.deleteCML(data.line_number,data.cml_number)
})

router.post('/deleteTP',(req,res)=>{
    
})

router.post('/deleteTN',(req,res)=>{
    
})


module.exports = router
