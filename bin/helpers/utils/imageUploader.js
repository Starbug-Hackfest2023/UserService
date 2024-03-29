const multer = require('multer');
const path = require('path');
const { unlinkAsync } = require('./deleteFile');
const wrapper = require('./wrapper');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../../../image/upload');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + new Date().getTime() + path.extname(file.originalname));
    },
});

const fileType = (file, cb) => {
    if (file.mimetype.includes('image')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported files!'), false);
    };
};

const upload = (req, res, next) => {
    multer({
        storage: storage,
        limits: {
        fileSize: 10*1024*1024
        },
        fileFilter: (req, file, cb) => {
        fileType(file, cb);
        },
    }).fields([
        {
        name: 'image',
        maxCount: 5,
        }
    ])(req, res, (err) => {
        if (err) {
        if (req.files.image) {
            req.files.image.forEach(async (element) => {
            await unlinkAsync(element.path);
            });
        }

        if (err.code) {
            // return res.rest.notAcceptable(err.code);
            console.log('Can\'t upload image');
            return wrapper.response(res, 'fail', wrapper.error(err), `Can't upload image. Error: ${err}`, 400)
        }

        //   return res.rest.notAcceptable(err);
            return wrapper.response(res, 'fail', wrapper.error(err), `Can't upload image. Error: ${err}`, 400)
        } else {
        next();
        }
    });
};

module.exports = upload;