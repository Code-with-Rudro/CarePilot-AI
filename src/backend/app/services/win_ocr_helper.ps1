param([string]$imagePath)

$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.SoftwareBitmap,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null

if (-not (Test-Path $imagePath)) {
    exit 0
}

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
})[0]

function Await-WinRt($op, [type]$targetType) {
    $method = $asTaskGeneric.MakeGenericMethod($targetType)
    $task = $method.Invoke($null, @($op))
    $task.Wait()
    return $task.Result
}

try {
    $resolved = (Resolve-Path $imagePath).Path
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($resolved)
    $storageFile = Await-WinRt $fileOp ([Windows.Storage.StorageFile])

    $streamOp = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = Await-WinRt $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = Await-WinRt $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

    $bitmapOp = $decoder.GetSoftwareBitmapAsync()
    $bitmap = Await-WinRt $bitmapOp ([Windows.Graphics.Imaging.SoftwareBitmap])

    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($null -eq $engine) {
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))
    }
    if ($null -eq $engine) {
        exit 0
    }

    $ocrOp = $engine.RecognizeAsync($bitmap)
    $ocrResult = Await-WinRt $ocrOp ([Windows.Media.Ocr.OcrResult])

    $words = @()
    foreach ($line in $ocrResult.Lines) {
        foreach ($w in $line.Words) {
            $words += [PSCustomObject]@{
                Text = $w.Text
                X = [int]$w.BoundingRect.X
                Y = [int]$w.BoundingRect.Y
            }
        }
    }

    $sortedWords = $words | Sort-Object Y, X
    $lines = @()
    $currentLine = @()
    $currentY = -1000

    foreach ($w in $sortedWords) {
        if ($currentY -eq -1000 -or [Math]::Abs($w.Y - $currentY) -le 30) {
            $currentLine += $w
            if ($currentY -eq -1000) { $currentY = $w.Y }
        } else {
            $lines += (($currentLine | Sort-Object X | ForEach-Object { $_.Text }) -join " ")
            $currentLine = @($w)
            $currentY = $w.Y
        }
    }
    if ($currentLine.Count -gt 0) {
        $lines += (($currentLine | Sort-Object X | ForEach-Object { $_.Text }) -join " ")
    }

    $lines -join "`n"
} catch {
    exit 0
}
