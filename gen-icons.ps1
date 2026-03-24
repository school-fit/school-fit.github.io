Add-Type -AssemblyName System.Drawing
Set-Location $PSScriptRoot
foreach ($sz in @(192, 512)) {
  $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(10, 10, 10))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(232, 255, 58))
  $fontPx = [int]($sz * 0.28)
  $font = New-Object System.Drawing.Font('Segoe UI', $fontPx, [System.Drawing.FontStyle]::Bold)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = 'Center'
  $sf.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF(0, 0, $sz, $sz)
  $g.DrawString('SF', $font, $brush, $rect, $sf)
  $out = Join-Path $PSScriptRoot "icon-$sz.png"
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}
Get-ChildItem (Join-Path $PSScriptRoot 'icon-*.png') | Select-Object Name, Length
