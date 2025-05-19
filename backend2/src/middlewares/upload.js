const multer = require('multer');
const path = require('path');

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 根据文件类型选择不同的目录
        const uploadPath = file.fieldname === 'song' ? 'uploads/songs' : 'uploads/covers';
        cb(null, path.join(__dirname, '../../', uploadPath));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'song') {
        // 音频文件类型限制
        if (!file.originalname.match(/\.(mp3|wav|ogg|m4a)$/)) {
            return cb(new Error('只允许上传音频文件!'), false);
        }
    } else if (file.fieldname === 'cover') {
        // 图片文件类型限制
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('只允许上传图片文件!'), false);
        }
    }
    cb(null, true);
};

// 创建multer实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 限制文件大小为10MB
    }
});

module.exports = upload; 