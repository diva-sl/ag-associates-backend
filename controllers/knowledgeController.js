import slugify from "slugify";

import KnowledgePost from "../models/KnowledgePost.js";
import KnowledgeCategory from "../models/KnowledgeCategory.js";
import KnowledgeQuestion from "../models/KnowledgeQuestion.js";
import KnowledgeRating from "../models/KnowledgeRating.js";

import { uploadToS3, deleteFromS3 } from "../utils/uploadToS3.js";

// export const createPost = async (req, res) => {
//   try {
//     const { title, content, category, status } = req.body;

//     const slug = slugify(title, {
//       lower: true,
//       strict: true,
//     });

//     const exists = await KnowledgePost.findOne({
//       slug,
//     });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Article already exists",
//       });
//     }

//     const words = content?.replace(/<[^>]*>/g, "")?.split(/\s+/).length || 0;

//     const readingTime = Math.max(1, Math.ceil(words / 200));

//     const post = await KnowledgePost.create({
//       ...req.body,

//       slug,

//       readingTime,

//       featuredImage: req.file?.path || "",

//       featuredImagePublicId: req.file?.filename || "",

//       publishedAt: status === "published" ? new Date() : null,

//       createdBy: req.user?._id,
//     });

//     res.status(201).json({
//       success: true,
//       data: post,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const createPost = async (req, res) => {
  try {
    const { title, content, status } = req.body;

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    const exists = await KnowledgePost.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Article already exists",
      });
    }

    const words = content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;

    const readingTime = Math.max(1, Math.ceil(words / 200));

    let imageUpload = null;

    if (req.file) {
      imageUpload = await uploadToS3(req.file, "public/knowledge-center");
    }

    const post = await KnowledgePost.create({
      ...req.body,

      slug,

      readingTime,

      featuredImage: imageUpload?.url || "",

      featuredImagePublicId: imageUpload?.key || "",

      publishedAt: status === "published" ? new Date() : null,

      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const updatePost = async (req, res) => {
//   try {
//     const post = await KnowledgePost.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Article not found",
//       });
//     }

//     let updateData = {
//       ...req.body,
//     };

//     if (req.body.title) {
//       updateData.slug = slugify(req.body.title, {
//         lower: true,
//         strict: true,
//       });
//     }

//     if (req.body.content) {
//       const words = req.body.content
//         .replace(/<[^>]*>/g, "")
//         .split(/\s+/).length;

//       updateData.readingTime = Math.max(1, Math.ceil(words / 200));
//     }

//     if (req.file) {
//       if (post.featuredImagePublicId) {
//         await cloudinary.uploader.destroy(post.featuredImagePublicId);
//       }

//       updateData.featuredImage = req.file.path;

//       updateData.featuredImagePublicId = req.file.filename;
//     }

//     const updated = await KnowledgePost.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       {
//         new: true,
//       },
//     );

//     res.json({
//       success: true,
//       data: updated,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const updatePost = async (req, res) => {
  try {
    const post = await KnowledgePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    let updateData = {
      ...req.body,
    };

    if (req.body.title) {
      updateData.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
      });
    }

    if (req.body.content) {
      const words = req.body.content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length;

      updateData.readingTime = Math.max(1, Math.ceil(words / 200));
    }

    if (req.file) {
      if (post.featuredImagePublicId) {
        await deleteFromS3(post.featuredImagePublicId);
      }

      const imageUpload = await uploadToS3(req.file, "knowledge-center");

      updateData.featuredImage = imageUpload.url;

      updateData.featuredImagePublicId = imageUpload.key;
    }

    const updated = await KnowledgePost.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const deletePost = async (req, res) => {
//   try {
//     const post = await KnowledgePost.findById(req.params.id);

//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Article not found",
//       });
//     }

//     if (post.featuredImagePublicId) {
//       await cloudinary.uploader.destroy(post.featuredImagePublicId);
//     }

//     await KnowledgeQuestion.deleteMany({
//       post: post._id,
//     });

//     await KnowledgeRating.deleteMany({
//       post: post._id,
//     });

//     await KnowledgePost.findByIdAndDelete(post._id);

//     res.json({
//       success: true,
//       message: "Article deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const deletePost = async (req, res) => {
  try {
    const post = await KnowledgePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (post.featuredImagePublicId) {
      await deleteFromS3(post.featuredImagePublicId);
    }

    await KnowledgeQuestion.deleteMany({
      post: post._id,
    });

    await KnowledgeRating.deleteMany({
      post: post._id,
    });

    await KnowledgePost.findByIdAndDelete(post._id);

    res.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      featured,
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          excerpt: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (featured) {
      query.featured = featured === "true";
    }

    const total = await KnowledgePost.countDocuments(query);

    const posts = await KnowledgePost.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,

      total,

      page,

      pages: Math.ceil(total / limit),

      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const createCategory = async (req, res) => {
//   try {
//     const slug = slugify(req.body.name, {
//       lower: true,
//       strict: true,
//     });

//     const exists = await KnowledgeCategory.findOne({
//       slug,
//     });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Category already exists",
//       });
//     }

//     const category = await KnowledgeCategory.create({
//       ...req.body,
//       slug,
//     });

//     res.status(201).json({
//       success: true,
//       data: category,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getPostBySlug = async (req, res) => {
  try {
    const post = await KnowledgePost.findOne({
      slug: req.params.slug,
    }).populate("category");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.views += 1;

    await post.save();

    const related = await KnowledgePost.find({
      category: post.category._id,

      _id: {
        $ne: post._id,
      },

      status: "published",
    })
      .limit(3)
      .select("title slug featuredImage excerpt");

    const questions = await KnowledgeQuestion.find({
      post: post._id,
      approved: true,
    });

    res.json({
      success: true,

      data: {
        post,
        related,
        questions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ratePost = async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
      });
    }

    const existing = await KnowledgeRating.findOne({
      post: req.params.id,

      ipAddress: req.ip,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already rated this article",
      });
    }

    await KnowledgeRating.create({
      post: req.params.id,

      rating,

      ipAddress: req.ip,
    });

    const ratings = await KnowledgeRating.find({
      post: req.params.id,
    });

    const average =
      ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;

    await KnowledgePost.findByIdAndUpdate(req.params.id, {
      averageRating: average,

      totalRatings: ratings.length,
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body;

    const update =
      helpful === true
        ? {
            $inc: {
              helpfulCount: 1,
            },
          }
        : {
            $inc: {
              notHelpfulCount: 1,
            },
          };

    await KnowledgePost.findByIdAndUpdate(req.params.id, update);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
export const addQuestion = async (req, res) => {
  try {
    const question = await KnowledgeQuestion.create({
      post: req.params.id,

      name: req.body.name,

      email: req.body.email,

      question: req.body.question,
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const question = await KnowledgeQuestion.findByIdAndUpdate(
      req.params.id,
      {
        answer: req.body.answer,
      },
      {
        new: true,
      },
    );

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const approveQuestion = async (req, res) => {
  try {
    const question = await KnowledgeQuestion.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
      },
      {
        new: true,
      },
    );

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await KnowledgeCategory.find().sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const exists = await KnowledgeCategory.findOne({
      slug,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await KnowledgeCategory.create({
      name,
      description,
      isActive,
      slug,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await KnowledgeCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const exists = await KnowledgeCategory.findOne({
      slug,
      _id: { $ne: req.params.id },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    category.name = name;
    category.description = description;
    category.isActive = isActive;
    category.slug = slug;

    await category.save();

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await KnowledgeCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const postsCount = await KnowledgePost.countDocuments({
      category: category._id,
    });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${postsCount} article(s) are assigned to this category.`,
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getKnowledgeAnalytics = async (req, res) => {
  try {
    const totalPosts = await KnowledgePost.countDocuments();

    const published = await KnowledgePost.countDocuments({
      status: "published",
    });

    const drafts = await KnowledgePost.countDocuments({
      status: "draft",
    });

    const totalQuestions = await KnowledgeQuestion.countDocuments();

    const totalRatings = await KnowledgeRating.countDocuments();

    /* Views */

    const viewsResult = await KnowledgePost.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$views",
          },
        },
      },
    ]);

    const totalViews = viewsResult[0]?.total || 0;

    /* Helpful Votes */

    const helpfulResult = await KnowledgePost.aggregate([
      {
        $group: {
          _id: null,
          helpfulVotes: {
            $sum: "$helpfulCount",
          },
        },
      },
    ]);

    const helpfulVotes = helpfulResult[0]?.helpfulVotes || 0;

    /* Average Rating */

    const ratingResult = await KnowledgeRating.aggregate([
      {
        $group: {
          _id: null,
          avgRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const avgRating = ratingResult[0]?.avgRating || 0;

    /* Top Articles */

    const topArticles = await KnowledgePost.find({
      status: "published",
    })
      .populate("category", "name")
      .select(
        `
          title
          slug
          views
          averageRating
          helpfulCount
          featuredImage
        `,
      )
      .sort({
        views: -1,
      })
      .limit(10);

    /* Category Statistics */

    const categoryStats = await KnowledgePost.aggregate([
      {
        $lookup: {
          from: "knowledgecategories",

          localField: "category",

          foreignField: "_id",

          as: "categoryInfo",
        },
      },

      {
        $unwind: "$categoryInfo",
      },

      {
        $group: {
          _id: "$categoryInfo.name",

          count: {
            $sum: 1,
          },

          views: {
            $sum: "$views",
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    /* Monthly Articles */

    const monthlyArticles = await KnowledgePost.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.json({
      success: true,

      data: {
        totalPosts,
        totalViews,
        totalQuestions,
        totalRatings,

        published,
        drafts,

        avgRating: Number(avgRating.toFixed(1)),

        helpfulVotes,

        topArticles,

        categoryStats,

        monthlyArticles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopArticles = async (req, res) => {
  try {
    const articles = await KnowledgePost.find({
      status: "published",
    })
      .populate("category", "name")
      .sort({
        views: -1,
      })
      .limit(10);

    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const stats = await KnowledgePost.aggregate([
      {
        $lookup: {
          from: "knowledgecategories",

          localField: "category",

          foreignField: "_id",

          as: "categoryInfo",
        },
      },

      {
        $unwind: "$categoryInfo",
      },

      {
        $group: {
          _id: "$categoryInfo.name",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await KnowledgePost.findById(req.params.id).populate(
      "category",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const toggleFeatured = async (req, res) => {
  try {
    const post = await KnowledgePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
      });
    }

    post.featured = !post.featured;

    await post.save();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const post = await KnowledgePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
      });
    }

    post.status = post.status === "published" ? "draft" : "published";

    if (post.status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const getFeaturedPosts = async (req, res) => {
  try {
    const posts = await KnowledgePost.find({
      featured: true,
      status: "published",
    })
      .populate("category")
      .sort({
        createdAt: -1,
      })
      .limit(6);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const posts = await KnowledgePost.find({
      status: "published",
    })
      .populate("category")
      .sort({
        views: -1,
      })
      .limit(10);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await KnowledgeQuestion.find().populate("post").sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
export const deleteQuestion = async (req, res) => {
  try {
    await KnowledgeQuestion.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Question deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
