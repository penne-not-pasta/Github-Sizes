// Get DOM elements
const form = document.getElementById('repository');
const urlInput = document.getElementById('url');
const sizeDisplay = document.getElementById('size');
const downloadLink = document.getElementById('download-link');

// Function to extract owner and repo from GitHub URL
function extractRepoInfo(url) {
    try {
        const parsedUrl = new URL(url);
        const [, owner, repo] = parsedUrl.pathname.split('/');
        return { owner, repo };
    } catch (error) {
        throw new Error('Invalid GitHub URL');
    }
}

// Function to get repository size
async function getRepoSize(owner, repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) {
            throw new Error('Repository not found');
        }
        const data = await response.json();
        return data.size; // Size is in KB
    } catch (error) {
        throw error;
    }
}

// Function to format size
function formatSize(sizeInKB) {
    if (sizeInKB < 1024) {
        return `${sizeInKB} KB`;
    } else if (sizeInKB < 1024 * 1024) {
        return `${(sizeInKB / 1024).toFixed(2)} MB`;
    } else {
        return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
    }
}

// Function to update download link
async function updateDownloadLink(owner, repo) {
    const branch = await getDefaultBranch(owner, repo);

    downloadLink.href = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
}


async function getDefaultBranch(owner, repo) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!response.ok) throw new Error("Repository not found");
    
    const data = await response.json();
    return data.default_branch; // usually 'main' or 'master'
}


// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a GitHub repository URL');
        return;
    }

    try {
        // Show loading state
        sizeDisplay.textContent = 'Size: Loading...';
        
        // Extract repo information
        const { owner, repo } = extractRepoInfo(url);
        
        // Get repository size
        const size = await getRepoSize(owner, repo);
        
        // Update size display
        sizeDisplay.textContent = `Size: ${formatSize(size)}`;
        
        // Update download link
        await updateDownloadLink(owner, repo);
        
    } catch (error) {
        sizeDisplay.textContent = `Size: Error - ${error.message}`;
    }
});
