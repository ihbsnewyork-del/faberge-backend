"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhotoByTitle = exports.getAllPhotos = exports.createUploadPhoto = void 0;
const uploadPhoto_validation_1 = require("./uploadPhoto.validation");
const uploadPhoto_model_1 = require("./uploadPhoto.model");
const createUploadPhoto = async (req, res) => {
    try {
        const validatedData = uploadPhoto_validation_1.uploadPhotoSchema.parse({
            title: req.body.title,
        });
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const isImage = req.file.mimetype.startsWith("image/");
        const isVideo = req.file.mimetype.startsWith("video/");
        if (!isImage && !isVideo) {
            res
                .status(400)
                .json({ message: "Only image or video files are allowed" });
            return;
        }
        const filePath = `/picture/dynamic_file/${req.file.filename}`;
        const fullFileUrl = `${filePath}`;
        const existingRecord = await uploadPhoto_model_1.UploadPhotoModel.findOne({
            title: validatedData.title.toLowerCase(),
        });
        if (existingRecord) {
            if (isImage)
                existingRecord.image = fullFileUrl;
            if (isVideo)
                existingRecord.video = fullFileUrl;
            await existingRecord.save();
            res.status(200).json({
                message: `${isImage ? "Image" : "Video"} updated successfully`,
                data: existingRecord,
            });
            return;
        }
        const newRecord = new uploadPhoto_model_1.UploadPhotoModel({
            title: validatedData.title.toLowerCase(),
            image: isImage ? fullFileUrl : null,
            video: isVideo ? fullFileUrl : null,
        });
        await newRecord.save();
        res.status(201).json({
            message: `${isImage ? "Image" : "Video"} uploaded successfully`,
            data: newRecord,
        });
    }
    catch (err) {
        if (err?.issues) {
            res.status(400).json({ errors: err.issues });
            return;
        }
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createUploadPhoto = createUploadPhoto;
const getAllPhotos = async (req, res) => {
    try {
        const photos = await uploadPhoto_model_1.UploadPhotoModel.find();
        res.status(200).json({ data: photos });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getAllPhotos = getAllPhotos;
const getPhotoByTitle = async (req, res) => {
    try {
        const { name } = req.params;
        const photo = await uploadPhoto_model_1.UploadPhotoModel.findOne({ title: name.toLowerCase() });
        if (!photo) {
            res.status(404).json({ message: "Photo not found" });
            return;
        }
        res.status(200).json({ data: photo });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getPhotoByTitle = getPhotoByTitle;
