$sourceDir = "c:\Users\CEEJAY\Documents\TIKTOK CLIPSS\APPLCATIONS\MYPORTFOLIO"
$targetDir = "c:\Users\CEEJAY\Documents\TIKTOK CLIPSS\APPLCATIONS\MYPORTFOLIO\sijey-portfolio\public\videos"

# Define mappings from source folder to target category
$folders = @{
    "CINEMATIC" = "cinematic"
    "EXPERIMENTS - AMV" = "experiments"
    "SHORTFORMS" = "shortforms"
}

foreach ($folder in $folders.GetEnumerator()) {
    $srcPath = Join-Path -Path $sourceDir -ChildPath $folder.Name
    $destPath = Join-Path -Path $targetDir -ChildPath $folder.Value
    
    # Create the destination directory if it doesn't exist
    if (-not (Test-Path -Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath | Out-Null
    }

    # Get all mp4 files in the source directory
    $videos = Get-ChildItem -Path $srcPath -Filter "*.mp4"
    foreach ($video in $videos) {
        $outputFile = Join-Path -Path $destPath -ChildPath $video.Name
        Write-Host "Compressing $($video.Name) from $($folder.Name) to $($folder.Value)..."
        
        # Run ffmpeg with compression settings
        # We use standard h264, crf 28 for decent web size vs quality trade-off, fast preset
        $ffmpegArgs = "-i `"$($video.FullName)`" -vcodec libx264 -crf 28 -preset fast -acodec aac -b:a 128k -y `"$outputFile`""
        
        $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -NoNewWindow -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "Successfully compressed $($video.Name)" -ForegroundColor Green
        } else {
            Write-Host "Failed to compress $($video.Name)" -ForegroundColor Red
        }
    }
}

Write-Host "All videos processed."
