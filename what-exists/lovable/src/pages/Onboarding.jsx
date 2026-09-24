// Onboarding is now unified into the store creation flow.
// This page redirects to /store/create for creators.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/store/create", { replace: true });
  }, [navigate]);
  return null;
}