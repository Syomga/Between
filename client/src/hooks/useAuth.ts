import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

export function useAuth(required: boolean): { loading: boolean } {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  useEffect(() => {
    let active = true;

    async function loadMe() {
      try {
        const me = await api.me();
        if (!active) {
          return;
        }
        setCurrentUser(me);
      } catch {
        if (!active) {
          return;
        }
        setCurrentUser(null);
        if (required) {
          navigate("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMe();
    return () => {
      active = false;
    };
  }, [navigate, required, setCurrentUser]);

  return { loading };
}
