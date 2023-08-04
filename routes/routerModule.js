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
    db.get(db.SelectTable.INFO,{},true).then((rows)=>{
        res.render('info.ejs',{datalist:rows})
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

    db.get(db.SelectTable.INFO,{
        line_number:line_number
    }).then((row)=>{
        const objList = [
            row.line_number,row.location,row.from,row.to,row.drawing_number,
            row.service,row.material,row.inservice_date,row.pipe_size,row.original_thickness,
            row.stress,row.joint_efficiency,row.ca,row.design_life,row.design_pressure,
            row.operating_pressure,row.design_temperature,row.operating_temperature
            
        ] 
        res.render('piping_info.ejs',{
            info_name:info_name,
            info_type:info_type,
            objList:objList
        })
    })

    // db.getInfo(line_number).then((obj)=>{
        
    // })
})
router.get('/pipingDetails',(req,res)=>{
    const line_number = req.query.line_number
    const cml_number = req.query.cml_number 
    const tp_number = req.query.tp_number

    console.log(`${line_number}\t${cml_number}\t${tp_number}`)

    db.get(db.SelectTable.CML,{line_number:line_number}).then((cml_data)=>{

        return new Promise((resolve,reject)=>{
            db.get(db.SelectTable.TP,{line_number:line_number,cml_number:cml_number},true).then((tp_data)=>{
                resolve([cml_data,tp_data])
            })
        })

    }).then(([cml_data,tp_data])=>{
        

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

    db.insert(db.SelectTable.INFO,data.data).then((data)=>{
        res.send('finish')
    })

})

router.post('/insertCML',(req,res)=>{
    const data = req.body
    var cmlList_client = data.data
    console.log(cmlList_client.length)

    db.get(db.SelectTable.INFO,{},true).then((row)=>{

        var actual_outside_diameter = process.actualOutsideDiameter_Cal(row.pipe_size)
        var design_thickness = process.designThickness_Cal(row.design_pressure,actual_outside_diameter,row.stress,row.joint_efficiency)
        var structural_thickness = process.structuralThickness_Cal()
        var required_thickness = process.requiredThickness_Cal(design_thickness,structural_thickness)

        console.log(`aod = ${actual_outside_diameter}\ndt = ${design_thickness}\nst = ${structural_thickness}\nrt = ${required_thickness}`)

        cmlList_client.push(actual_outside_diameter)
        cmlList_client.push(design_thickness)
        cmlList_client.push(structural_thickness)
        cmlList_client.push(required_thickness)

        db.insert(db.SelectTable.CML,cmlList_client)
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
    console.log('delete data = ',data)

    // db.deleteCML(data.line_number,data.cml_number)
    db.remove(db.SelectTable.CML,{},true)
})

router.post('/deleteTP',(req,res)=>{
    
})

router.post('/deleteTN',(req,res)=>{
    
})


module.exports = router
