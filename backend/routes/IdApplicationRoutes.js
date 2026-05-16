const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
    getMyApplications,
    getIdApplications,
    getIdApplication,
    createIdApplication,
    updateStatus,
    uploadPhoto,
    uploadAlumniIdPhoto,
    uploadAlumniSignature,
    deleteIdApplication
} = require("../controllers/IdApplicationController");

router.get("/",    protect, getIdApplications);
router.get("/my",  protect, getMyApplications);
router.get("/:id", protect, getIdApplication);
router.post("/",   protect, createIdApplication);
router.post("/upload-photo/:id",          protect, upload.single("photo"),     uploadPhoto);
router.post("/upload-id-photo/:id",       protect, upload.single("photo"),     uploadAlumniIdPhoto);
router.post("/upload-id-signature/:id",   protect, upload.single("signature"), uploadAlumniSignature);
router.put("/:id", protect, updateStatus);
router.delete("/:id", protect, deleteIdApplication);

module.exports = router;