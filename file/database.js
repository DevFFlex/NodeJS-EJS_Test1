var sql3 = require('sqlite3').verbose()
var db = new sql3.Database('dtb.db')

db.serialize(function(){

    var sql_command1 = 'CREATE TABLE IF NOT EXISTS Info(line_number varchar(200) PRIMARY KEY,location varchar(200),`from` varchar(200),`to` varchar(200),drawing_number varchar(200),service varchar(200),material varchar(200),inservice_date date,pipe_size INTEGER,original_thickness INTEGER,stress INTEGER,joint_efficiency INTEGER,ca INTEGER,design_life INTEGER,design_pressure INTEGER,operating_pressure INTEGER,design_temperature INTEGER,operating_temperature INTEGER);'
    var sql_command2 = 'CREATE TABLE IF NOT EXISTS CML(line_number varchar(200),cml_number INTEGER PRIMARY KEY AUTOINCREMENT,cml_description varchar(200),actual_outside_diameter INTEGER,design_thickness INTEGER,structural_thickness INTEGER,required_thickness INTEGER,FOREIGN KEY (line_number) REFERENCES Info(line_number));'
    var sql_command3 = 'CREATE TABLE IF NOT EXISTS TestPoint(line_number varchar(200),cml_number INTEGER ,tp_number INTEGER PRIMARY KEY AUTOINCREMENT,tp_description INTEGER,note varchar(200),FOREIGN KEY (line_number) REFERENCES Info(line_number),FOREIGN KEY (cml_number) REFERENCES CML(cml_number));'
    var sql_command4 = 'CREATE TABLE IF NOT EXISTS Thickness(line_number varchar(200),cml_number INTEGER,tp_number INTEGER,tn_number INTEGER PRIMARY KEY AUTOINCREMENT,inspection_date date,actual_thickness INTEGER,FOREIGN KEY (line_number) REFERENCES Info(line_number),FOREIGN KEY (cml_number) REFERENCES CML(cml_number),FOREIGN KEY (tp_number) REFERENCES TestPoint(tp_number));'
    db.run(sql_command1)
    db.run(sql_command2)
    db.run(sql_command3)
    db.run(sql_command4)

})

const SelectTable = {
    INFO:1,
    CML:2,
    TP:3,
    TN:4
}


function sql_run(sql_command,datalist = null){
    return new Promise((resolve,reject)=>{
        db.serialize(function(){
            db.run(sql_command,datalist,(result,error)=>{
                if(!error)resolve(result)
                else reject(error)
            })
        })
    })
}



// ------------- Insert ---------

function insert(selectTable,dataList){
    const insertInfoCommand = `INSERT INTO Info (line_number,location,"from","to",drawing_number,service,material,inservice_date,pipe_size,original_thickness,stress,joint_efficiency,ca,design_life,design_pressure,operating_pressure,design_temperature,operating_temperature) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`
    const insertCMLCommand = `INSERT INTO CML (line_number,cml_description,actual_outside_diameter,design_thickness,structural_thickness,required_thickness) VALUES (?,?,?,?,?,?);`
    const insertTPCommand = `INSERT INTO TestPoint (line_number,cml_number,tp_description,note) VALUES (?,?,?,?);`
    const insertTNCommand = `INSERT INTO Thickness (line_number,cml_number,tp_number,inspection_date,actual_thickness) VALUES (?,?,?,?,?);`

    switch(selectTable){
        case SelectTable.INFO:
            return sql_run(insertInfoCommand,dataList)
        case SelectTable.CML:
            return sql_run(insertCMLCommand,dataList)
        case SelectTable.TP:
            return sql_run(insertTPCommand,dataList)
        case SelectTable.TN:
            return sql_run(insertTNCommand,dataList)
    }
}


// ------------- Get ---------

function get(selectTable,conditionObject = {}){
    var conditionObjectCount = (conditionObject !== null) ? Object.values(conditionObject).length : 0

    var tablename = ''
    if(selectTable === SelectTable.INFO)tablename ='Info'
    else if(selectTable === SelectTable.CML)tablename ='CML'
    else if(selectTable === SelectTable.TP)tablename ='TestPoint'
    else if(selectTable === SelectTable.TN)tablename ='Thickness'

    
    var getCommand = `SELECT * FROM ${tablename}`
    if(conditionObjectCount > 0)getCommand += ' WHERE '
    Object.keys(conditionObject).forEach((key) => {
        const value = conditionObject[key]
        getCommand += key + " = '" + value + "' "

        if(conditionObjectCount > 1)getCommand += "AND "
        else getCommand += ";"
        conditionObjectCount--
    })

    return new Promise((resolve,reject)=>{
        db.serialize(()=>{
            console.log(getCommand)
            db.all(getCommand, (err, rows_row) => {
                if (err)reject(err)
                else resolve(rows_row)
            })
        })
    })
}



// ------------- Delete ----------
function remove(selectTable,conditionObject = {}){
    var conditionObjectCount = (conditionObject !== null) ? Object.values(conditionObject).length : 0
    
    if(conditionObjectCount === 0 && !deleteAllRows)return

    var tablename = ''
    if(selectTable === SelectTable.INFO)tablename ='Info'
    else if(selectTable === SelectTable.CML)tablename ='CML'
    else if(selectTable === SelectTable.TP)tablename ='TestPoint'
    else if(selectTable === SelectTable.TN)tablename ='Thickness'

    var getCommand = `DELETE FROM ${tablename}`
    if(conditionObjectCount > 0)getCommand += ' WHERE '
    Object.keys(conditionObject).forEach((key) => {
        const value = conditionObject[key]
        getCommand += key + " = '" + value + "' "

        if(conditionObjectCount > 1)getCommand += "AND "
        else getCommand += ";"
        conditionObjectCount--
    })

    return new Promise((resolve,reject)=>{
        db.serialize(()=>{
            db.all(getCommand, (err, rows_row) => {
                if (err)reject(err)
                else resolve(rows_row)
            })
        })
    })
}


module.exports = {
    SelectTable,
    insert,
    get,
    remove
}
