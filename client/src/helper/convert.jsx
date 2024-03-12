export default function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error('Invalid file type. Expected Blob or File.'));
      return;
    }

    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
