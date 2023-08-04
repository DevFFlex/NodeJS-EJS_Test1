const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../file/database')
const process = require('../file/process')
const { send } = require('process')

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

router.post('/input_page',(req,res)=>{
    const data_body = req.body
    const from = data_body.from
    const datalist = data_body.datalist
    console.log(datalist.length)
    var header_name = ""
    var namelist = null
    var typelist = null
    

    if(from === 'info'){
        header_name = "Insert Pipe"
        namelist = info_name
        typelist = info_type
    }else if(from === 'cml'){
        header_name = "Insert CML"
        namelist = cml_name
        typelist = cml_type
    }else if(from === 'tp'){
        header_name = "Insert TestPoint"
        namelist = tp_name
        typelist = tp_type
    }else if(from === 'tn'){
        header_name = "Insert Thickness"
        namelist = tn_name
        typelist = tn_type
    }

    res.render('addPage.ejs',{
        header:from,
        header_name:header_name,
        namelist:namelist,
        typelist:typelist,
        datalist:datalist
    })

    
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
        
        return new Promise((resolve,reject)=>{
            db.get(db.SelectTable.TN,{line_number:line_number,cml_number:cml_number,tp_number:tp_number}).then((tn_data)=>{
                resolve([cml_data,tp_data,tn_data])
            })
        })
    }).then(([cml_data,tp_data,tn_data])=>{
        res.render('piping_details.ejs',{
            line_number:line_number,
            cml_number:cml_number,
            tp_number:tp_number,
            cmlList:cml_data,
            tpList:tp_data,
            tnList:tn_data
    
        })
    })



    
})



//------------------------------------- DB --------------------------


router.post('/api-insert',(req,res)=>{
    const data = req.body

    const table_name = data.table_name
    const datalist   = data.datalist

    console.log(datalist)

    var selector = null
    if(table_name === 'info')selector = db.SelectTable.INFO
    else if(table_name === 'cml')selector = db.SelectTable.CML
    else if(table_name === 'tp')selector = db.SelectTable.TP
    else if(table_name === 'tn')selector = db.SelectTable.TN

    if(selector !== null){
        db.insert(selector,datalist).then((data)=>{
            res.send('finish')
        })
    }else console.log('insert error tablename is null!!')

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
