export const subscriptionEmailTemplate = ({
  name,
  planName,
  subtotal,
  gstAmount,
  totalAmount,
  invoiceNumber,
  expiryDate,
}) => {
  return `

<!DOCTYPE html>

<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Subscription Activated</title>
</head>

<body style="
margin:0;
padding:0;
background:#f4f6f9;
font-family:Segoe UI,Arial,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
<tr>
<td align="center">

<table width="700" cellpadding="0" cellspacing="0" style="
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 15px 40px rgba(0,0,0,0.08);
">

<tr>
<td style="
background:linear-gradient(135deg,#511D43,#901E3E);
padding:40px;
text-align:center;
">

<img
src="https://agandassociates.org/ag-logo.png"
alt="AG & Associates"
style="
width:90px;
height:auto;
margin-bottom:15px;
"
/>

<h1 style="
margin:0;
font-size:32px;
color:#ffffff;
font-weight:700;
">
AG & ASSOCIATES
</h1>

<p style="
margin-top:10px;
color:#ffffffcc;
font-size:15px;
">
Corporate Tax Consultants & Compliance Experts
</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<div style="text-align:center;">

<div style="
width:80px;
height:80px;
border-radius:50%;
background:#ecfdf5;
margin:auto;
font-size:40px;
line-height:80px;
color:#16a34a;
">
✓
</div>

<h2 style="
margin-top:20px;
color:#111827;
">
Subscription Activated Successfully
</h2>

<p style="
font-size:15px;
line-height:1.7;
color:#6b7280;
">
Hello <strong>${name}</strong>,
<br />
Thank you for choosing AG & Associates.
Your subscription has been activated successfully and payment has been received.
</p>

</div>

<div style="
margin-top:30px;
background:#f8fafc;
border:1px solid #e5e7eb;
border-radius:16px;
padding:25px;
">

<h3 style="
margin-top:0;
color:#511D43;
">
Subscription Details
</h3>

<table width="100%" cellpadding="10">

<tr>
<td><strong>Plan Name</strong></td>
<td align="right">${planName}</td>
</tr>

<tr>
<td><strong>Invoice Number</strong></td>
<td align="right">${invoiceNumber}</td>
</tr>

<tr>
<td><strong>Plan Amount</strong></td>
<td align="right">₹${subtotal}</td>
</tr>

<tr>
<td><strong>GST (18%)</strong></td>
<td align="right">₹${gstAmount}</td>
</tr>

<tr>
<td><strong>Subscription Valid Until</strong></td>
<td align="right">
${new Date(expiryDate).toLocaleDateString("en-IN")}
</td>
</tr>

<tr style="
background:#eef2ff;
border-radius:10px;
">
<td style="
font-size:18px;
font-weight:bold;
">
Total Paid
</td>

<td align="right" style="
font-size:22px;
font-weight:bold;
color:#511D43;
">
₹${totalAmount}
</td>
</tr>

</table>

</div>

<div style="
margin-top:30px;
padding:25px;
background:#faf5ff;
border-radius:16px;
">

<h3 style="
margin-top:0;
color:#511D43;
">
What's Included
</h3>

<ul style="
padding-left:20px;
line-height:2;
color:#374151;
">

<li>Dedicated Tax Expert Support</li>

<li>Priority Consultation Assistance</li>

<li>Income Tax Return Filing Support</li>

<li>GST Compliance Guidance</li>

<li>Document Review Assistance</li>

<li>Business Advisory Support</li>

<li>Renewal Notifications</li>

<li>Client Dashboard Access</li>

</ul>

</div>

<div style="
text-align:center;
margin-top:35px;
">

<a
href="https://agandassociates.org/profile"
style="
display:inline-block;
background:#511D43;
color:#ffffff;
padding:14px 30px;
border-radius:10px;
text-decoration:none;
font-weight:600;
"

>

View Subscription </a>

</div>

</td>
</tr>

<tr>
<td style="
padding:30px;
background:#f9fafb;
border-top:1px solid #e5e7eb;
text-align:center;
">

<h3 style="
margin:0;
color:#511D43;
">
AG & ASSOCIATES
</h3>

<p style="
margin-top:10px;
font-size:13px;
color:#6b7280;
">
46, Malaiamman Nagar,
M Pudupalayam,
Tirupur - 641665,
Tamil Nadu, India
</p>

<p style="
font-size:13px;
color:#6b7280;
">
Email: info@agandassociates.org
</p>

<p style="
font-size:13px;
color:#6b7280;
">
GSTIN: 33AZRPA1920F1ZT
</p>

<p style="
margin-top:20px;
font-size:12px;
color:#9ca3af;
">
This is an automated subscription confirmation email.
</p>

<p style="
font-size:12px;
color:#9ca3af;
">
© ${new Date().getFullYear()} AG & ASSOCIATES. All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
