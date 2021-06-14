const xlsxFile = require('read-excel-file/node');
const Student=require('./models/student')
const Job=require('./models/job');
const { update } = require('./models/student');
xlsxFile('./adv.xlsx').then((rows) => {
    cols=[]
for (i in rows){
           cols.push(rows[i][0]);
           
}
console.log(cols);
for(let j=1;j<cols.length();j++){
        const student = await Student.findOne({ rollNo:cols[j] });
    
    if (!student)
    return res.status(400).send({
        message: 'The rollnumber is not present'
    });
    else{
        const id=student._id;
        Job.findByIdAndUpdate(id,{qualified:qualified.push(id)},(err)=>{
            if(err){
                console.log(error)
            }
            else{
                console.log('updated jobs sucessfully')
            }
        })
    }
}
})