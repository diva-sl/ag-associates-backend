import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    companyName: String,
    email: String,
    phone: String,
    whatsapp: String,
    address: String,

    logo: String,

    social: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
      youtube: String,
      whatsapp: String,
      googleBusiness: String,
      telegram: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
      ogImage: String,
      twitterImage: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SiteSetting", siteSettingSchema);
