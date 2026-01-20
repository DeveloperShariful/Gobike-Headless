//lib/graphql/affiliateQueries.ts

export const GET_AFFILIATE_DASHBOARD = `
  query GetAffiliateDashboard($secretKey: String!) {
    affiliateDashboard(secretKey: $secretKey) {
      affiliateId
      status
      commissionRate
      referralUrl
      
      # New Fields for Custom Slug
      isCustomSlugEnabled
      currentCustomSlug
      
      # Stats Cards
      totalVisits
      totalReferrals
      totalEarnings
      paidEarnings
      unpaidEarnings
      storeCredit
      
      # Charts Data
      visitsChart {
        date
        value
      }
      referralsChart {
        date
        value
      }
      
      # Lists (Recent Data)
      referrals {
        id
        amount
        commission
        status
        date
        description
      }
      visits {
        id
        url
        referrer
        converted
        date
      }
      coupons {
        id
        code
        amount
        discountType
        usageCount
      }
      payouts {
        id
        amount
        method
        status
        date
      }
      creatives {
        id
        name
        description
        url
        image
      }
    }
  }
`;