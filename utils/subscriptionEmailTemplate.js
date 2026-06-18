export const subscriptionEmailTemplate = ({
  name,
  planName,
  amount,
  expiryDate,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>

<body style="margin:0;padding:0;background:#f5f6fa;font-family:Arial,sans-serif;">

<div style="max-width:700px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

<div style="background:linear-gradient(135deg,#511D43,#901E3E);padding:40px;text-align:center;color:#fff;">
<h1 style="margin:0;">AG & ASSOCIATES</h1>
<p style="margin-top:10px;">
Subscription Activated Successfully
</p>
</div>

<div style="padding:40px;">

<h2>Hello ${name},</h2>

<p>
Thank you for choosing AG & Associates.
Your subscription has been successfully activated.
</p>

<table style="width:100%;border-collapse:collapse;margin-top:25px;">
<tr>
<td style="padding:12px;border-bottom:1px solid #eee;">
<strong>Plan</strong>
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${planName}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;">
<strong>Amount Paid</strong>
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
₹${amount}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;">
<strong>Valid Until</strong>
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${new Date(expiryDate).toLocaleDateString()}
</td>
</tr>
</table>

<div style="margin-top:30px;padding:20px;background:#f8f8f8;border-radius:10px;">
<h3>Benefits Included</h3>

<ul>
<li>Dedicated Tax Expert Assistance</li>
<li>Priority Client Support</li>
<li>Document Review Services</li>
<li>Compliance Monitoring</li>
<li>Expert Advisory Assistance</li>
</ul>
</div>

<p style="margin-top:30px;">
Need help?
Contact our support team anytime.
</p>

</div>

<div style="background:#f5f5f5;padding:20px;text-align:center;color:#666;font-size:12px;">
© ${new Date().getFullYear()} AG & ASSOCIATES.
All Rights Reserved.
</div>

</div>

</body>
</html>
`;
};
