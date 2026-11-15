import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import mockProducts from "../../sample-products.json";
import { clearProductCache } from "../lib/productCache";

const P2PContext = createContext(null);

const STORAGE_LISTINGS_KEY = "dex_p2p_user_listings";
const STORAGE_OFFERS_KEY = "dex_p2p_offers";
const STORAGE_INQUIRIES_KEY = "dex_p2p_inquiries";

export function P2PProvider({ children }) {
  // P2P Listings created by sellers on DEX
  const [userListings, setUserListings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // P2P Offers made by buyers on DEX
  const [offers, setOffers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_OFFERS_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: "offer-sample-1",
          deviceId: "dex-img-01",
          deviceName: "GE Healthcare Logiq E9 XDclear Ultrasound System",
          originalPrice: 28500,
          offerAmount: 26000,
          inspectionPeriod: "7-Day BioMed Clinical Acceptance",
          status: "Pending Seller Review",
          sellerName: "New England BioMed Systems",
          buyerFacility: "St. Luke Diagnostic Center",
          buyerContact: "dr.reyes@stlukes.org",
          notes: "Contingent on electrical safety test and probe element integrity check.",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });

  // Seller inquiries
  const [inquiries, setInquiries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_INQUIRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(userListings));
  }, [userListings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_OFFERS_KEY, JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  // Create a new P2P listing
  const createListing = useCallback((listingData) => {
    const newId = `dex-user-${Date.now()}`;
    const newListing = {
      id: newId,
      name: listingData.name,
      brand: listingData.brand || "Medical Specialist",
      category: listingData.category || "Diagnostic & Imaging",
      subCategory: listingData.subCategory || "Clinical Hardware",
      price: parseFloat(listingData.price) || 0,
      originalPrice: parseFloat(listingData.originalPrice) || (parseFloat(listingData.price) * 1.8),
      discount: "P2P Direct Listing",
      rating: 5.0,
      reviewCount: 1,
      isBestseller: false,
      inStock: true,
      condition: listingData.condition || "Hospital Surplus (Biomed Tested)",
      year: parseInt(listingData.year) || new Date().getFullYear(),
      fdaCleared: true,
      biomedCalibrated: listingData.biomedCalibrated ?? true,
      warranty: listingData.warranty || "30-Day DEX SafeTrade Inspection Period",
      location: listingData.location || "United States",
      seller: {
        name: listingData.sellerName || "Verified Healthcare Provider",
        type: listingData.sellerType || "Clinic / Hospital Surplus",
        verified: true,
        rating: 5.0,
        dealsCompleted: 1,
      },
      description: listingData.description || "Direct peer-to-peer listing on DEX Medical Device Exchange.",
      features: listingData.features && listingData.features.length > 0
        ? listingData.features
        : [
            "Biomedical inspection checklist verified",
            "Power supply and clinical functionality tested",
            "Complete with standard clinical power cables"
          ],
      shipping: listingData.shipping || "Insured Crated Freight or Clinic Pickup",
      image: listingData.image || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
      isP2PUserListing: true,
      createdAt: new Date().toISOString(),
    };

    setUserListings((prev) => [newListing, ...prev]);
    clearProductCache();
    return newListing;
  }, []);

  // Delete user listing
  const deleteListing = useCallback((id) => {
    setUserListings((prev) => prev.filter((item) => item.id !== id));
    clearProductCache();
  }, []);

  // Make a P2P offer
  const makeOffer = useCallback((offerData) => {
    const newOffer = {
      id: `offer-${Date.now()}`,
      deviceId: offerData.deviceId,
      deviceName: offerData.deviceName,
      originalPrice: offerData.originalPrice,
      offerAmount: parseFloat(offerData.offerAmount),
      inspectionPeriod: offerData.inspectionPeriod || "48-Hour Acceptance Window",
      status: "Offer Submitted (Under Seller Review)",
      sellerName: offerData.sellerName || "Verified Medical Seller",
      buyerFacility: offerData.buyerFacility || "Private Clinic",
      buyerContact: offerData.buyerContact,
      notes: offerData.notes || "",
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [newOffer, ...prev]);
    return newOffer;
  }, []);

  // Send inquiry / inspection request
  const sendInquiry = useCallback((inquiryData) => {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      deviceId: inquiryData.deviceId,
      deviceName: inquiryData.deviceName,
      sellerName: inquiryData.sellerName,
      senderName: inquiryData.senderName,
      senderEmail: inquiryData.senderEmail,
      message: inquiryData.message,
      type: inquiryData.type || "General Inquiry",
      createdAt: new Date().toISOString(),
    };

    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  }, []);

  // Combined product catalog: user listings + standard catalog
  const combinedProducts = useMemo(() => {
    return [...userListings, ...mockProducts];
  }, [userListings]);

  const value = useMemo(
    () => ({
      userListings,
      offers,
      inquiries,
      createListing,
      deleteListing,
      makeOffer,
      sendInquiry,
      combinedProducts,
    }),
    [userListings, offers, inquiries, createListing, deleteListing, makeOffer, sendInquiry, combinedProducts]
  );

  return <P2PContext.Provider value={value}>{children}</P2PContext.Provider>;
}

export function useP2P() {
  const ctx = useContext(P2PContext);
  if (!ctx) {
    throw new Error("useP2P must be used within a P2PProvider");
  }
  return ctx;
}
