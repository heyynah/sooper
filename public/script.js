const dropArea = document.getElementById("drop-area");
const inputFile = document.getElementById("input-file");
const imageView = document.getElementById("img-view");
const resolvedView = document.getElementById("resolved-img-view");
const cancelButton = document.getElementById("cancel-button");
const submitButton = document.getElementById("submit-button");

inputFile.addEventListener("change", uploadImage);
cancelButton.addEventListener("click", cancelUpload);
submitButton.addEventListener("click", submitImage);

function uploadImage() {
    let imgLink = URL.createObjectURL(inputFile.files[0]);
    imageView.style.backgroundImage = `url(${imgLink})`;
    imageView.textContent = "";
    imageView.style.border = 0;
}

function cancelUpload() {
    if (imageView.style.backgroundImage === 'none') {
        alert("There is no uploaded image to cancel.");
    } else {
        imageView.style.backgroundImage = 'none';
        resolvedView.style.backgroundImage = 'none';
        imageView.innerHTML = `
            <img src="img/upload.png">
            <p>Drag and drop or click here<br> to upload image</p>
            <span>Upload any images from desktop</span>
        `;
        imageView.style.border = "2px dashed #bbb5ff";
    }
}

function submitImage() {
    if (imageView.style.backgroundImage === 'none') {
        alert("There's no uploaded image to submit.");
    } else {
        const imgData = inputFile.files[0];
        
        const formData = new FormData();
        formData.append('image', imgData);

        const serverUrl = window.location.origin; // Get the server URL

        fetch(`${serverUrl}/process_image`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const processedImageUrl = `${serverUrl}/processed_images/${inputFile.files[0].name.replace('.png', '')}_rlt.png`; // Construct URL for processed image
            resolvedView.style.backgroundImage = `url(${processedImageUrl})`;
            resolvedView.style.border = "2px solid #bbb5ff";
        })
        .catch(error => console.error('Error:', error));
    }
}

dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
});

dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

window.onload = function () {
    if (!inputFile.files.length) {
        cancelUpload();
    }
};
