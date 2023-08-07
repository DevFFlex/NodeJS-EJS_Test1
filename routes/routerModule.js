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
const tn_type = ['date','number']


router.get('/',(req,res)=>{
    console.log('request /')
    db.get(db.SelectTable.INFO,{},true).then((rows)=>{
        res.render('info.ejs',{datalist:rows})
    })

    
})
router.get('/input_page',(req,res)=>{
    console.log('request /input_page')
    const data_query = req.query
    const from = data_query.from
    const datalist = JSON.parse(data_query.datalist)

    var header_name = ""
    var namelist = null
    var typelist = null


    if(from === 'info'){
        header_name = "Insert Pipe"
        namelist = info_name
        typelist = info_type
        datalist.push('')
        datalist.push('')
        datalist.push('')
    }else if(from === 'cml'){
        header_name = "Insert CML"
        namelist = cml_name
        typelist = cml_type
        datalist.push('')
        datalist.push('')
    }else if(from === 'tp'){
        header_name = "Insert TestPoint"
        namelist = tp_name
        typelist = tp_type
        datalist.push('')
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
    console.log('request /pipingInfo')
    const line_number = req.params.id
    
    
    db.get(db.SelectTable.INFO,{line_number:line_number}).then((row)=>{
        var objList = [
            row[0].line_number,row[0].location,row[0].from,row[0].to,row[0].drawing_number,
            row[0].service,row[0].material,row[0].inservice_date,row[0].pipe_size,row[0].original_thickness,
            row[0].stress,row[0].joint_efficiency,row[0].ca,row[0].design_life,row[0].design_pressure,
            row[0].operating_pressure,row[0].design_temperature,row[0].operating_temperature
            
        ]

        objList.forEach((item,index)=>{
            objList[index] = item.toString()
        })

  
        res.render('piping_info.ejs',{
            info_name:info_name,
            info_type:info_type,
            objList:objList
        })
    })
})
router.get('/pipingDetails',(req,res)=>{
    console.log('request /pipingDetails')
    const line_number = req.query.line_number
    const cml_number = req.query.cml_number 
    const tp_number = req.query.tp_number

    console.log(`${line_number}\t${cml_number}\t${tp_number}`)


    db.get(db.SelectTable.CML,{line_number:line_number}).then((cml_data)=>{


        return new Promise((resolve,reject)=>{

            if(cml_number === '-1' && tp_number === '-1')resolve([cml_data,[],[]])
            else if(tp_number === '-1'){
                db.get(db.SelectTable.TP,{line_number:line_number,cml_number:cml_number},true).then((tp_data)=>{
                    resolve([cml_data,tp_data,[]])
                })
            }else{
                db.get(db.SelectTable.TP,{line_number:line_number,cml_number:cml_number},true).then((tp_data)=>{
                    db.get(db.SelectTable.TN,{line_number:line_number,cml_number:cml_number,tp_number:tp_number}).then((tn_data)=>{
                        resolve([cml_data,tp_data,tn_data]) 
                    })
                })
                
            }

            
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

    const from = data.table_name
    const datalist   = data.datalist

    var selector = null
    if(from === 'info')selector = db.SelectTable.INFO
    else if(from === 'cml'){
        selector = db.SelectTable.CML
        db.get(db.SelectTable.INFO,{line_number:datalist[0]}).then((infodata)=>{
            console.log('datalist = ',+infodata)
            var aod = process.actualOutsideDiameter_Cal(infodata.pipe_size)
            var dt = process.designThickness_Cal(infodata.design_pressure,aod,infodata.stress,infodata.joint_efficiency)
            var st = process.structuralThickness_Cal(infodata.pipe_size)
            var rt = process.requiredThickness_Cal(dt,st)

            datalist.push(aod)
            datalist.push(dt)
            datalist.push(st)
            datalist.push(rt)

            db.insert(selector,datalist).then((data)=>{
                res.send('finish')
            })
        
            
        })

        return
    }
    else if(from === 'tp')selector = db.SelectTable.TP
    else if(from === 'tn')selector = db.SelectTable.TN

    if(selector !== null){
        db.insert(selector,datalist).then((data)=>{
            res.send('finish')
        })
    }else console.log('insert error tablename is null!!')

})
router.post('/api-remove',(req,res)=>{
    const data = req.body
    const from = data.from
    const datalist = data.datalist
    const condition = data.condition

    var selector = 0
    if(from === 'info')selector = db.SelectTable.INFO
    else if(from === 'cml')selector = db.SelectTable.CML
    else if(from === 'tp')selector = db.SelectTable.TP
    else if(from === 'tn')selector = db.SelectTable.TN

    // db.remove(selector,condition).then((re)=>{
    //     res.send('delete success')
    // })

    console.log('post api remove')
    db.removeSelect(datalist).then((ddd)=>{
        res.send(ddd)
    })

})

module.exports = router
