//http://127.0.0.1:8092/sw2/php/tdtmdb.php?szl=cia&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&TILEMATRIX=15&TILEROW=5026&TILECOL=26734&FORMAT=tiles
//http://127.0.0.1:3001/cia/15/26734/5026
const sqlite3 = require('sqlite3').verbose();
const sqliteDbArr = {
    "tdtimg":{
        "dbDir":"d:/data/zzdb/img",
        "ext":"png"
    },
    "cia":{
        "dbDir":"d:/data/zzdb/roaddbs",
        "ext":"png"
    }
};
const defaultImgPath = "d:/SZTT/default.png";
var defaultImg = "";
require("fs").readFile(defaultImgPath, function (err, data) {
   if (err) {
       return console.error(err);
   }
   defaultImg = data;
});


function responseError(error, response){
    response.statusCode = 500;
	
	response.setHeader('Content-Type', 'image/png');
	response.write(defaultImg, "binary");
    // response.setHeader("Content-Type", "text/plain");
    // response.write(error + "\n");
    response.end();
}

function get(reqArry, response, request) {
	
	let limitCellCount = 160;
    let lyr = reqArry[1];
    let zoom = reqArry[2];
    let x = reqArry[3];
    let y = reqArry[4];

    let dbX = Math.floor(x / limitCellCount);
    let dbY = Math.floor(y / limitCellCount);

    if(!!!sqliteDbArr.hasOwnProperty(lyr)){
        responseError(lyr + " not valid",response);
        return;
    }

    let dbName = sqliteDbArr[lyr]["dbDir"] + "/"+zoom + "_"+ dbX + "_" + dbY + ".mdb";

    // if(!require('fs').existsSync(dbName)){
    //     responseError("db is not exists", response);
    //     return;
    // }

    var db = new sqlite3.Database(dbName,sqlite3.OPEN_READONLY,function(err){
        if(err){
            responseError(err, response);
            //console.log('fail on opendb ' + dbName);
        }
    }); 
    var sqlStr = "SELECT tile_data FROM tiles where zoom_level="+zoom+ " and tile_column="+x+" and tile_row="+y + " limit 1";
    db.get(sqlStr,function(err, obj) {
            if (err) {
                console.log('fail on get ' + err);
                responseError(err,response);
            } 
            else {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'image/png');
                response.write(obj.tile_data, "binary");
                response.end();
            }
        }
    );
}

exports.get = get;