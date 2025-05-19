const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // 构建错误响应
    const errorResponse = {
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    };

    // 处理特定类型的错误
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: '数据验证错误',
            errors: Object.values(err.errors).map(error => error.message)
        });
    }

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).json({
            success: false,
            message: '找不到请求的资源'
        });
    }

    // 处理文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: '文件大小超出限制'
        });
    }

    // 返回错误响应
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 