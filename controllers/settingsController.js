import SiteSetting from "../models/SiteSetting.js";
import LegalPage from "../models/LegalPage.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = await SiteSetting.create({});
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = await SiteSetting.create(req.body);
    } else {
      settings = await SiteSetting.findByIdAndUpdate(settings._id, req.body, {
        returnDocument: "after",
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLegalPage = async (req, res) => {
  try {
    const page = await LegalPage.findOne({
      page: req.params.page,
    });

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateLegalPage = async (req, res) => {
  try {
    const page = await LegalPage.findOneAndUpdate(
      {
        page: req.params.page,
      },
      {
        page: req.params.page,
        title: req.body.title,
        content: req.body.content,
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPublicLegalPage = async (req, res) => {
  try {
    const page = await LegalPage.findOne({
      page: req.params.page,
    });

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
