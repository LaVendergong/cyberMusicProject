const connection = require('./connection')
const songModel = require('./songSchema')

connection(()=>{
// 调用 songModel 的 create 方法插入多条歌曲数据到数据库
songModel.create(
    [
        {songName: '华鸟风月', singer: 'senya', album: 'Imagine', duration: 346, genre: 'Touhou', releaseDate: '2012-05-27', songPath: '/localmusics/1141641196.mp3',imgPath: 'images/1364980325.jpg'},
        {songName: 'Lengsel', singer: 'Rigel Theatre', album: 'Lengsel - Ghosts of Memories -（2nd）', duration: 302, genre: 'Rigel', releaseDate: '2019-04-28', songPath: '/localmusics/M500000Chlmc3w2fol.mp3',imgPath: 'images/1710178784.jpg'},
        {songName: 'Riness -Ghosts of Memories', singer: 'Rigel Theatre&Miwele', album: 'Lengsel - Ghosts of Memories -（2nd）', duration: 350, genre: 'Rigel', releaseDate: '2019-04-28', songPath: '/localmusics/M500002MCk5I4bl9YC.mp3',imgPath: 'images/397886913.jpg'}
    ]
).then((result) => {
    console.log('数据插入成功', result);
}).catch((error) => {
    console.log('数据插入失败', error);
});
    

    songModel.find({}).then((data,err)=>{
        if(err){
            console.log(err)
        }else{
            console.log(data)
        }
    })
},(err)=>{
    console.log(err)
    console.log('数据库连接失败')
})

