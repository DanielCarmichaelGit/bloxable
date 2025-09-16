# Bloxable Email Templates

This folder contains branded HTML email templates for the Bloxable platform. All templates are designed to match the clean, modern UI design and branding of Bloxable.io.

## 📧 Available Templates

### 1. **welcome-email.html**

- **Purpose**: Welcome new users to Bloxable
- **Use Case**: After successful account creation
- **Features**: Platform introduction, getting started guide, CTA to marketplace

### 2. **confirmation-email.html**

- **Purpose**: Email confirmation for new accounts
- **Use Case**: When users need to verify their email address
- **Features**: Clear CTA button, security information, expiration notice

### 3. **seller-welcome-email.html**

- **Purpose**: Welcome new sellers to the platform
- **Use Case**: After seller account creation
- **Features**: Commission rates, seller benefits, dashboard access, next steps

### 4. **password-reset-email.html**

- **Purpose**: Password reset functionality
- **Use Case**: When users request password reset
- **Features**: Security-focused design, clear CTA, expiration notice

### 5. **sale-notification-email.html**

- **Purpose**: Notify sellers of new sales
- **Use Case**: When a workflow is purchased
- **Features**: Sale details, earnings breakdown, performance stats, pro tips

## 🎨 Design Features

- **Dark Mode Theme**: Matches Bloxable's dark UI design
- **Responsive Design**: Works on all email clients and devices
- **Branded Logo**: Consistent "B" logo with gradient styling
- **Color Scheme**:
  - Primary: Blue (#3b82f6) to Purple (#8b5cf6) gradients
  - Success: Green (#10b981) for positive actions
  - Error: Red (#ef4444) for warnings/errors
  - Background: Dark slate (#0f172a, #1e293b)
  - Text: Light grays (#f8fafc, #e2e8f0, #cbd5e1)

## 🔧 Supabase Integration

### Template Variables

All templates use Supabase's standard template variables:

- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Confirmation/reset link
- `{{ .Token }}` - Security token
- `{{ .RedirectTo }}` - Redirect URL after action

### Custom Variables (for sale notifications)

- `{{ .SaleAmount }}` - Amount earned after commission
- `{{ .WorkflowName }}` - Name of purchased workflow
- `{{ .ListPrice }}` - Original listing price
- `{{ .CommissionRate }}` - Commission percentage
- `{{ .TotalSales }}` - Seller's total sales count
- `{{ .TotalRevenue }}` - Seller's total revenue
- `{{ .ActiveWorkflows }}` - Number of active workflows
- `{{ .MonthlyRevenue }}` - Current month revenue

## 📋 How to Use

1. **Copy the HTML content** from any template file
2. **Paste into Supabase** email template editor
3. **Replace variables** with your actual values
4. **Test the template** with sample data
5. **Save and activate** the template

## 🎯 Template Usage Guide

### For User Onboarding

1. Use `confirmation-email.html` for email verification
2. Use `welcome-email.html` after confirmation
3. Use `seller-welcome-email.html` for seller accounts

### For Account Management

1. Use `password-reset-email.html` for password resets
2. Use `sale-notification-email.html` for seller notifications

## 🔍 Testing

Before deploying, test each template with:

- Different email clients (Gmail, Outlook, Apple Mail)
- Mobile and desktop devices
- Light and dark mode preferences
- Various screen sizes

## 📝 Customization

To customize templates:

1. Edit the HTML directly
2. Modify colors in the `<style>` section
3. Update content in the HTML body
4. Add/remove sections as needed
5. Test thoroughly before deployment

## 🚀 Deployment

1. Copy template content to Supabase
2. Configure template variables
3. Set up email triggers
4. Test with real users
5. Monitor delivery and engagement

---

**Note**: All templates are optimized for email clients and include fallbacks for better compatibility across different platforms.
