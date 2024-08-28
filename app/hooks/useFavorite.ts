import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

import { User } from "@prisma/client";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
    listingId: string;
    currentUser?: User | null;
}

const useFavorite = ({
    listingId,
    currentUser,
}: IUseFavorite) => {
    const router = useRouter();
    const loginModal = useLoginModal();


    const hasFavorited = useMemo(() => {
        const list = currentUser?.favouriteIds || [];

        return list.includes(listingId);
    }, [currentUser, listingId])

    const toggleFavorite = useCallback(async (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        e.stopPropagation();

        if(!currentUser)
        {
            return loginModal.onOpen();
        }

        try {
            let request;

            if (hasFavorited) {
                request = axios.delete(`/api/favorites/${listingId}`);   
            }
            else
            {
                request = axios.post(`/api/favorites/${listingId}`);
            }

            const favor = await request;
            router.refresh();
            toast.success('Success')
            return favor;
        } catch (error) {
            toast.error('Something Went Wrong');
        }
    },[currentUser, hasFavorited, listingId, loginModal, router]);

    return {hasFavorited, toggleFavorite}
}
export default useFavorite;