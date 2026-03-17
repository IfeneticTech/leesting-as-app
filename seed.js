// /* eslint-disable @typescript-eslint/no-require-imports */

// // seed.js
// require('dotenv').config({ path: '.env.local' });
// const { createClient } = require('@supabase/supabase-js');
// const fs = require('fs');
// const path = require('path');

// // 1. Initialize Supabase with Admin Privileges (Service Role)
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// const seedDataDir = path.join(__dirname, 'seed_data');

// async function seedDatabase() {
//     console.log('🚀 Starting Relational Database Seeder...');

//     // 2. Get all the release folders inside /seed_data
//     const releaseFolders = fs.readdirSync(seedDataDir, { withFileTypes: true })
//         .filter(dirent => dirent.isDirectory())
//         .map(dirent => dirent.name);

//     if (releaseFolders.length === 0) {
//         console.log('❌ No folders found in /seed_data. Please add some release folders.');
//         return;
//     }

//     // 3. Loop through every Release Folder (e.g., "Scorpion", "Water")
//     for (const folderName of releaseFolders) {
//         const folderPath = path.join(seedDataDir, folderName);
//         console.log(`\n======================================`);
//         console.log(`💿 Processing Release: ${folderName}`);

//         // Find all MP3s in this specific folder
//         const songFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));
//         const trackCount = songFiles.length;

//         if (trackCount === 0) {
//             console.log(`⚠️ No .mp3 files found in ${folderName}, skipping...`);
//             continue;
//         }

//         // --- UPGRADE 1: Auto-Detect Release Type ---
//         // --- UPGRADE 1: Auto-Detect Release Type (Industry Standard) ---
//         let releaseType = 'album';
        
//         if (trackCount >= 1 && trackCount <= 2) {
//             releaseType = 'single';
//         } else if (trackCount >= 3 && trackCount <= 6) {
//             releaseType = 'ep';
//         } else {
//             releaseType = 'album'; // 7 or more tracks
//         }
        
//         console.log(`📊 Detected as: ${releaseType.toUpperCase()} (${trackCount} tracks)`);

//         // --- UPGRADE 2: Extract Artist from the First Track ---
//         const firstTrackName = path.parse(songFiles[0]).name; // e.g., "Drake - Gods Plan"
//         const artistName = firstTrackName.split(' - ')[0].trim(); // Chops at the dash, leaves "Drake"

//         // --- UPGRADE 3: Relational Linking (Find or Create Artist) ---
//         let artistId;
//         const { data: existingArtist } = await supabase
//             .from('artists')
//             .select('id')
//             .eq('name', artistName)
//             .single();

//         if (existingArtist) {
//             artistId = existingArtist.id;
//         } else {
//             console.log(`👤 Creating new Artist Profile: ${artistName}`);
//             const { data: newArtist, error: artistError } = await supabase
//                 .from('artists')
//                 .insert({ name: artistName })
//                 .select('id')
//                 .single();
//             if (artistError) throw artistError;
//             artistId = newArtist.id;
//         }

//         // --- UPGRADE 4: The "First Image Wins" Rule (Master Album Cover) ---
//         const imageFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
//         let albumImagePath = null; 

//         if (imageFiles.length > 0) {
//             const masterCoverFile = imageFiles[0]; // Grabs the first image it finds
//             console.log(`🖼️ Selected Album Cover: ${masterCoverFile}`);
            
//             const coverBuffer = fs.readFileSync(path.join(folderPath, masterCoverFile));

//             const { error: coverUploadError } = await supabase.storage
//                 .from('images')
//                 .upload(`public-seed-album-${masterCoverFile}`, coverBuffer, { 
//                     upsert: true,
//                     contentType: masterCoverFile.endsWith('.png') ? 'image/png' : 'image/jpeg' 
//                 });
            
//             if (!coverUploadError) {
//                 albumImagePath = `public-seed-album-${masterCoverFile}`;
//             }
//         }

//         // --- UPGRADE 5: Create the Album using the Artist ID and Cover Image ---
//         console.log(`💽 Creating ${releaseType} in database...`);
//         const { data: albumData, error: albumError } = await supabase
//             .from('albums')
//             .insert({
//                 title: folderName,
//                 artist_id: artistId,
//                 release_type: releaseType,
//                 image_path: albumImagePath 
//             })
//             .select('id')
//             .single();
//         if (albumError) throw albumError;
//         const albumId = albumData.id;

//         // --- UPGRADE 6: Loop through and Upload EVERY song in this folder ---
//         for (const songFile of songFiles) {
//             try {
//                 const baseName = path.parse(songFile).name;
//                 const trackTitle = baseName.split(' - ')[1].trim(); // Chops at dash, leaves "Gods Plan"
//                 const specificImageFile = `${baseName}.jpg`;

//                 console.log(`   ⏳ Uploading track: ${trackTitle}...`);

//                 // Upload Audio File
//                 const audioBuffer = fs.readFileSync(path.join(folderPath, songFile));
//                 const { error: audioError } = await supabase.storage
//                     .from('songs')
//                     .upload(`public-seed-${songFile}`, audioBuffer, { 
//                         upsert: true,
//                         contentType: 'audio/mpeg'
//                      });
//                 if (audioError) throw audioError;

//                 // Check for a track-specific image (rare, but good to have)
//                 let trackImagePath = null;
//                 if (fs.existsSync(path.join(folderPath, specificImageFile))) {
//                     const imageBuffer = fs.readFileSync(path.join(folderPath, specificImageFile));
//                     const { error: imageError } = await supabase.storage
//                         .from('images')
//                         .upload(`public-seed-${specificImageFile}`, imageBuffer, { 
//                             upsert: true,
//                             contentType: 'image/jpeg'
//                          });
//                     if (!imageError) trackImagePath = `public-seed-${specificImageFile}`;
//                 }

//                 // --- UPGRADE 7: Insert the Song with Image Inheritance ---
//                 const { error: dbError } = await supabase
//                     .from('songs')
//                     .insert({
//                         title: trackTitle,
//                         author: artistName, // Kept so your current UI doesn't break instantly
//                         song_path: `public-seed-${songFile}`,
//                         image_path: trackImagePath || albumImagePath, // INHERITANCE LOGIC
//                         artist_id: artistId, // Relational Link
//                         album_id: albumId    // Relational Link
//                     });
//                 if (dbError) throw dbError;

//                 console.log(`   ✅ Success: ${trackTitle}`);
//             } catch (err) {
//                 console.error(`   ❌ Failed on ${songFile}:`, err.message);
//             }
//         }
//     }
//     console.log('\n🎉 MEGA-SEEDING COMPLETE! Your database is now fully relational.');
// }

// seedDatabase();






/* eslint-disable @typescript-eslint/no-require-imports */

// seed.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Initialize Supabase with Admin Privileges (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const seedDataDir = path.join(__dirname, 'seed_data');

// ---> THE THROTTLE: A helper function to pause the script
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function seedDatabase() {
    console.log('🚀 Starting Bulletproof Database Seeder...');

    // 2. Get all the release folders inside /seed_data
    const releaseFolders = fs.readdirSync(seedDataDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    if (releaseFolders.length === 0) {
        console.log('❌ No folders found in /seed_data. Please add some release folders.');
        return;
    }

    // 3. Loop through every Release Folder
    for (const folderName of releaseFolders) {
        const folderPath = path.join(seedDataDir, folderName);
        console.log(`\n======================================`);
        console.log(`💿 Processing Release: ${folderName}`);

        // Find all MP3s in this specific folder
        const songFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));
        const trackCount = songFiles.length;

        if (trackCount === 0) {
            console.log(`⚠️ No .mp3 files found in ${folderName}, skipping...`);
            continue;
        }

        // --- UPGRADE 1: Auto-Detect Release Type (Industry Standard) ---
        let releaseType = 'album';
        if (trackCount >= 1 && trackCount <= 2) {
            releaseType = 'single';
        } else if (trackCount >= 3 && trackCount <= 6) {
            releaseType = 'ep';
        } else {
            releaseType = 'album'; 
        }
        
        console.log(`📊 Detected as: ${releaseType.toUpperCase()} (${trackCount} tracks)`);

        // --- UPGRADE 2: SAFETY Extract Artist from the First Track ---
        const firstTrackName = path.parse(songFiles[0]).name; 
        let artistName = "Unknown Artist";
        if (firstTrackName.includes(' - ')) {
            artistName = firstTrackName.split(' - ')[0].trim(); 
        }

        // --- UPGRADE 3: Relational Linking (Find or Create Artist) ---
        let artistId;
        const { data: existingArtist } = await supabase
            .from('artists')
            .select('id')
            .eq('name', artistName)
            .single();

        if (existingArtist) {
            artistId = existingArtist.id;
        } else {
            console.log(`👤 Creating new Artist Profile: ${artistName}`);
            const { data: newArtist, error: artistError } = await supabase
                .from('artists')
                .insert({ name: artistName })
                .select('id')
                .single();
            if (artistError) throw artistError;
            artistId = newArtist.id;
        }

        // --- UPGRADE 4: The "First Image Wins" Rule (Master Album Cover) ---
        const imageFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
        let albumImagePath = null; 

        if (imageFiles.length > 0) {
            const masterCoverFile = imageFiles[0]; 
            console.log(`🖼️ Selected Album Cover: ${masterCoverFile}`);
            
            const coverBuffer = fs.readFileSync(path.join(folderPath, masterCoverFile));

            const { error: coverUploadError } = await supabase.storage
                .from('images')
                .upload(`public-seed-album-${masterCoverFile}`, coverBuffer, { 
                    upsert: true,
                    contentType: masterCoverFile.endsWith('.png') ? 'image/png' : 'image/jpeg' 
                });
            
            if (!coverUploadError) {
                albumImagePath = `public-seed-album-${masterCoverFile}`;
            }
        }

        // --- UPGRADE 5: Create the Album using the Artist ID and Cover Image ---
        console.log(`💽 Creating ${releaseType} in database...`);
        const { data: albumData, error: albumError } = await supabase
            .from('albums')
            .insert({
                title: folderName,
                artist_id: artistId,
                release_type: releaseType,
                image_path: albumImagePath 
            })
            .select('id')
            .single();
        if (albumError) throw albumError;
        const albumId = albumData.id;

        // --- UPGRADE 6: Loop through and Upload EVERY song in this folder ---
        for (const songFile of songFiles) {
            try {
                const baseName = path.parse(songFile).name;
                
                // SAFETY UPGRADE: Safely extract the track title
                let trackTitle = baseName;
                if (baseName.includes(' - ')) {
                    trackTitle = baseName.split(' - ')[1].trim(); 
                }

                const specificImageFile = `${baseName}.jpg`;

                console.log(`   ⏳ Uploading track: ${trackTitle}...`);

                // Upload Audio File
                const audioBuffer = fs.readFileSync(path.join(folderPath, songFile));
                const { error: audioError } = await supabase.storage
                    .from('songs')
                    .upload(`public-seed-${songFile}`, audioBuffer, { 
                        upsert: true,
                        contentType: 'audio/mpeg'
                     });
                if (audioError) throw audioError;

                // Check for a track-specific image
                let trackImagePath = null;
                if (fs.existsSync(path.join(folderPath, specificImageFile))) {
                    const imageBuffer = fs.readFileSync(path.join(folderPath, specificImageFile));
                    const { error: imageError } = await supabase.storage
                        .from('images')
                        .upload(`public-seed-${specificImageFile}`, imageBuffer, { 
                            upsert: true,
                            contentType: 'image/jpeg'
                         });
                    if (!imageError) trackImagePath = `public-seed-${specificImageFile}`;
                }

                // --- UPGRADE 7: Insert the Song with Image Inheritance ---
                const { error: dbError } = await supabase
                    .from('songs')
                    .insert({
                        title: trackTitle,
                        author: artistName, 
                        song_path: `public-seed-${songFile}`,
                        image_path: trackImagePath || albumImagePath, 
                        artist_id: artistId, 
                        album_id: albumId    
                    });
                if (dbError) throw dbError;

                console.log(`   ✅ Success: ${trackTitle}`);
                
                // ---> THE FIX: Wait for 1.5 seconds before uploading the next song
                await delay(1500);

            } catch (err) {
                console.error(`   ❌ Failed on ${songFile}:`, err.message);
            }
        }
    }
    console.log('\n🎉 MEGA-SEEDING COMPLETE! Your database is now fully relational.');
}

seedDatabase();