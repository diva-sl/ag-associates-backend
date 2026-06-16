import SuccessStory from "../models/SuccessStory.js";
import cloudinary from "../config/cloudinary.js";

/* GET ALL */

export const getStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find().sort({
      createdAt: -1,
    });

    res.json(stories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* GET ONE */

export const getStoryById = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.views += 1;
    await story.save();

    res.json(story);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* CREATE */

export const createStory = async (req, res) => {
  try {
    const story = await SuccessStory.create(req.body);

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* UPDATE */

export const updateStory = async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.json(story);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* DELETE */

// export const deleteStory = async (req, res) => {
//   try {
//     const story = await SuccessStory.findById(req.params.id);

//     if (!story) {
//       return res.status(404).json({
//         message: "Story not found",
//       });
//     }

//     await story.deleteOne();

//     res.json({
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const deleteStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    /* DELETE COVER IMAGE */

    if (story.coverImagePublicId) {
      await cloudinary.uploader.destroy(story.coverImagePublicId, {
        resource_type: "image",
      });
    }

    /* DELETE PDF */

    if (story.pdfPublicId) {
      await cloudinary.uploader.destroy(story.pdfPublicId, {
        resource_type: "raw",
      });
    }

    await story.deleteOne();

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
/* FEATURE */
export const toggleFeatured = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.featured = !story.featured;

    await story.save();

    res.json({
      success: true,
      story,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* PUBLISH */

export const togglePublishStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.status = story.status === "published" ? "draft" : "published";

    await story.save();

    res.json(story);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// export const togglePublish = async (req, res) => {
//   try {
//     const story = await SuccessStory.findById(req.params.id);

//     story.status = story.status === "published" ? "draft" : "published";

//     await story.save();

//     res.json(story);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

/* ANALYTICS */

export const getStoryAnalytics = async (req, res) => {
  try {
    const totalStories = await SuccessStory.countDocuments();

    const publishedStories = await SuccessStory.countDocuments({
      status: "published",
    });

    const featuredStories = await SuccessStory.countDocuments({
      featured: true,
    });

    const analytics = await SuccessStory.aggregate([
      {
        $group: {
          _id: null,

          totalViews: {
            $sum: "$views",
          },

          totalDownloads: {
            $sum: "$downloads",
          },
        },
      },
    ]);

    res.json({
      totalStories,
      publishedStories,
      featuredStories,
      draftStories: totalStories - publishedStories,
      totalViews: analytics[0]?.totalViews || 0,
      totalDownloads: analytics[0]?.totalDownloads || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// export const uploadStoryAssets = async (req, res) => {
//   try {
//     console.log(req.files);
//     const coverImage = req.files?.coverImage?.[0];

//     const pdf = req.files?.pdf?.[0];

//     res.json({
//       coverImage: coverImage?.path || "",

//       coverImagePublicId: coverImage?.filename || "",

//       pdfUrl: pdf?.path || "",

//       pdfPublicId: pdf?.filename || "",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
export const uploadStoryAssets = async (req, res) => {
  try {
    console.log("FILES =>", req.files);

    const coverImage = req.files?.coverImage?.[0];
    const pdf = req.files?.pdf?.[0];

    console.log("IMAGE =>", coverImage);
    console.log("PDF =>", pdf);

    res.json({
      coverImage: coverImage?.path || "",
      coverImagePublicId: coverImage?.filename || "",

      pdfUrl: pdf?.path || "",
      pdfPublicId: pdf?.filename || "",
    });
  } catch (error) {
    console.error("UPLOAD ERROR =>", error);

    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getPublishedStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({
      status: "published",
    }).sort({
      featured: -1,
      createdAt: -1,
    });

    res.json(stories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const downloadStoryPdf = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.downloads += 1;

    await story.save();

    res.json({
      success: true,
      downloadUrl: story.pdfUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPublicStoryById = async (req, res) => {
  try {
    const story = await SuccessStory.findOne({
      _id: req.params.id,
      status: "published",
    });

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.views += 1;

    await story.save();

    res.json(story);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
