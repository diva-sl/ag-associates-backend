import SuccessStory from "../models/SuccessStory.js";

import { uploadToS3, deleteFromS3 } from "../utils/uploadToS3.js";

import { getSignedFileUrl } from "../utils/uploadToS3.js";

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
  if (!req.body.title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }
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

// export const updateStory = async (req, res) => {
//   try {
//     const story = await SuccessStory.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true },
//     );

//     res.json(story);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const updateStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    Object.assign(story, req.body);

    const updatedStory = await story.save();

    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
/* DELETE */

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

    const signedUrl = await getSignedFileUrl(story.pdfPublicId);

    res.json({
      success: true,
      downloadUrl: signedUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    if (story.coverImagePublicId) {
      await deleteFromS3(story.coverImagePublicId);
    }

    if (story.pdfPublicId) {
      await deleteFromS3(story.pdfPublicId);
    }

    await story.deleteOne();

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error(error);

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

export const uploadStoryAssets = async (req, res) => {
  try {
    const coverImage = req.files?.coverImage?.[0];
    const pdf = req.files?.pdf?.[0];

    let imageUpload = null;
    let pdfUpload = null;

    // if (coverImage) {
    //   imageUpload = await uploadToS3(coverImage, "success-stories/images");
    // }

    // if (pdf) {
    //   pdfUpload = await uploadToS3(pdf, "success-stories/pdfs");
    // }

    if (coverImage) {
      imageUpload = await uploadToS3(
        coverImage,
        "public/success-stories/images",
      );
    }

    if (pdf) {
      pdfUpload = await uploadToS3(pdf, "private/success-stories/pdfs");
    }

    res.json({
      success: true,

      coverImage: imageUpload?.url || "",

      coverImagePublicId: imageUpload?.key || "",

      pdfUrl: pdfUpload?.url || "",

      pdfPublicId: pdfUpload?.key || "",
    });
  } catch (error) {
    console.error("UPLOAD ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message,
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

// export const downloadStoryPdf = async (req, res) => {
//   try {
//     const story = await SuccessStory.findById(req.params.id);

//     if (!story) {
//       return res.status(404).json({
//         message: "Story not found",
//       });
//     }

//     story.downloads += 1;

//     await story.save();

//     res.json({
//       success: true,
//       downloadUrl: story.pdfUrl,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

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
