var sql3 = require('sqlite3').verbose()
var db = new sql3.Database('dtb.db')

db.serialize(function(){

    var sql_command1 = 'CREATE TABLE IF NOT EXISTS Info(line_number varchar(200) PRIMARY KEY,location varchar(200),`from` varchar(200),`to` varchar(200),drawing_number varchar(200),service varchar(200),material varchar(200),inservice_date date,pipe_size INTEGER,original_thickness INTEGER,stress INTEGER,joint_efficiency INTEGER,ca INTEGER,design_life INTEGER,design_pressure INTEGER,operating_pressure INTEGER,design_temperature INTEGER,operating_temperature INTEGER);'
    var sql_command2 = 'CREATE TABLE IF NOT EXISTS CML(line_number varchar(200),cml_number INTEGER PRIMARY KEY AUTOINCREMENT,cml_description varchar(200),actual_outside_diameter INTEGER,design_thickness INTEGER,structural_thickness INTEGER,required_thickness INTEGER,FOREIGN KEY (line_number) REFERENCES Info(line_number));'
    var sql_command3 = 'CREATE TABLE IF NOT EXISTS TestPoint(line_number varchar(200),cml_number INTEGER ,tp_number INTEGER PRIMARY KEY AUTOINCREMENT,tp_description INTEGER,note varchar(200),FOREIGN KEY (line_number) REFERENCES Info(line_number),FOREIGN KEY (cml_number) REFERENCES CML(cml_number));'
    var sql_command4 = 'CREATE TABLE IF NOT EXISTS Thickness(line_number varchar(200),cml_number INTEGER,tp_number INTEGER,inspection_date date,actual_thickness INTEGER,FOREIGN KEY (line_number) REFERENCES Info(line_number),FOREIGN KEY (cml_number) REFERENCES CML(cml_number),FOREIGN KEY (tp_number) REFERENCES TestPoint(tp_number));'
    db.run(sql_command1)
    db.run(sql_command2)
    db.run(sql_command3)
    db.run(sql_command4)

})


function insertInfo(info_data){
    const insertQuery = `INSERT INTO Info (line_number,location,"from","to",drawing_number,service,material,inservice_date,pipe_size,original_thickness,stress,joint_efficiency,ca,design_life,design_pressure,operating_pressure,design_temperature,operating_temperature) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`

    db.serialize(function(){
        db.run(insertQuery,info_data,(result,error)=>{
            if(!error){
                console.log("database run : " + result)
            }else{
                console.log("database error : " + error)
            }
        })
    })
}

function getInfoAll(){
    const _sql = 'SELECT * FROM Info'

    return new Promise((resolve,reject)=>{
        db.serialize(() => {
            db.all(_sql, (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
        });
    })
}

function deleteInfo(line_number){
    const _sql = `DELETE FROM Info WHERE line_number = '${line_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })

}

function getInfo(line_number){
    const _sql = `SELECT * FROM Info WHERE line_number="${line_number}"`

    return new Promise((resolve,reject) =>{
        db.serialize(() => {
            db.get(_sql,(err,row) =>{
                if(err)reject(err)
                else resolve(row)
            })
        })
    })
}





function insertCML(cmlList){
    const _sql = `INSERT INTO CML (line_number,cml_description,actual_outside_diameter,design_thickness,structural_thickness,required_thickness) VALUES (?,?,?,?,?,?);`

    db.serialize(function(){
        db.run(_sql,cmlList,(result,error)=>{
            if(!error){
                console.log("database run : " + result)
            }else{
                console.log("database error : " + error)
            }
        })
    })
}

function getCMLAll(line_number){
    const _sql = `SELECT * FROM CML WHERE line_number = '${line_number}'`

    return new Promise((resolve,reject)=>{
        db.serialize(() =>{
            db.all(_sql,(err,rows)=>{
                if(err)reject(err)
                else resolve(rows)
            })
        })
    })
}


function deleteCML(line_number,cml_number){
    const _sql = `DELETE FROM CML WHERE line_number = '${line_number}' AND cml_number = ${cml_number}`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}

function deleteCMLAll(line_number){
    const _sql = `DELETE FROM CML WHERE line_number = '${line_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}


function insertTP(tpList){
    const _sql = `INSERT INTO TestPoint (line_number,cml_number,tp_description,note) VALUES (?,?,?,?);`

    db.serialize(function(){
        db.run(_sql,tpList,(result,error)=>{
            if(!error){
                console.log("database run : " + result)
            }else{
                console.log("database error : " + error)
            }
        })
    })
}

function getTPAll(line_number,cml_number){
    const _sql = `SELECT * FROM TestPoint WHERE line_number = '${line_number}' AND cml_number = '${cml_number}'`

    return new Promise((resolve,reject)=>{
        db.serialize(() =>{
            db.all(_sql,(err,rows)=>{
                if(err)reject(err)
                else resolve(rows)
            })
        })
    })
}

function deleteTP(line_number,cml_number,tp_number){
    const _sql = `DELETE FROM TestPoint WHERE line_number = '${line_number}' AND cml_number = ${cml_number} AND tp_number = '${tp_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}

function deleteTPAll(line_number,cml_number){
    const _sql = `DELETE FROM TestPoint WHERE line_number = '${line_number}' AND cml_number = '${cml_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}




function insertTN(tpList){
    const _sql = `INSERT INTO Thickness (line_number,cml_number,tp_number,inspection_date,actual_thickness) VALUES (?,?,?,?,?);`

    db.serialize(function(){
        db.run(_sql,tpList,(result,error)=>{
            if(!error){
                console.log("database run : " + result)
            }else{
                console.log("database error : " + error)
            }
        })
    })
}

function getTNAll(line_number,cml_number,tp_number){
    const _sql = `SELECT * FROM Thickness WHERE line_number = '${line_number}' AND cml_number = '${cml_number}' AND tp_number = '${tp_number}'`

    return new Promise((resolve,reject)=>{
        db.serialize(() =>{
            db.all(_sql,(err,rows)=>{
                if(err)reject(err)
                else resolve(rows)
            })
        })
    })
}

function deleteTN(line_number,cml_number,tp_number){
    const _sql = `DELETE FROM Thickness WHERE line_number = '${line_number}' AND cml_number = ${cml_number} AND tp_number = '${tp_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}

function deleteTNAll(line_number,cml_number){
    const _sql = `DELETE FROM Thickness WHERE line_number = '${line_number}' AND cml_number = '${cml_number}'`

    db.serialize(() => {
        db.run(_sql,(resault,err) =>{
            if(!err)console.log('delete success')
            else console.log('delete fail : ' + err)
        })
    })
}






module.exports = {
    insertInfo,
    deleteInfo,
    getInfoAll,
    getInfo,

    insertCML,
    getCMLAll,
    deleteCML,
    deleteCMLAll,

    insertTP,
    getTPAll,
    deleteTP,
    deleteTPAll
}
