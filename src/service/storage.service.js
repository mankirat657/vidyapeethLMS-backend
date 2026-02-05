import ImageKit from 'imagekit'
import "dotenv/config"
const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

export async function uploadFile(file,filename){
    try {
        const response = await imagekit.upload({
            file : file,
            filename : filename,
            folder: "practice"
        });
        return resposne;
    } catch (error) {
        console.error(`error occured while uploading ${error}`)
        throw error;
    }
}