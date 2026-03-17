// import { Song } from "@/types";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";


// const getSongs = async (): Promise<Song[]> => {
//     const supabase = createServerComponentClient({
//         cookies: cookies
//     });

//     const { data, error } = await supabase
//         .from('songs')
//         .select('*')
//         .order('created_at', { ascending: false });

//         if (error) {
//             console.log(error);
//         }

//         return (data as any) || [];
// };

// export default getSongs;







import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getSongs = async (): Promise<Song[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    // THE UPGRADE: We are now telling Supabase to grab the song, 
    // AND to join the matching artist and album data to it!
    const { data, error } = await supabase
        .from('songs')
        .select('*, artists(*), albums(*)') 
        .order('created_at', { ascending: false });

        if (error) {
            console.log(error.message);
        }

        return (data as any) || [];
};

export default getSongs;