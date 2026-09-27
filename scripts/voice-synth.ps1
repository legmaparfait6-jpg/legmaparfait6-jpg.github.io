# Synthèse vocale Windows, appelée par scripts/make-voice.mjs.
# Entrée : un fichier JSON [{ "text": "...", "lang": "fr" | "en", "out": "chemin.wav" }].
# Français : voix OneCore « Microsoft Paul » (homme). Anglais : première voix
# anglaise masculine installée, sinon « Zira » (le traitement du signal abaisse
# ensuite le timbre).
param([Parameter(Mandatory = $true)][string]$Jobs)
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Speech
[Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media, ContentType = WindowsRuntime] | Out-Null

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
function Await($operation, [Type]$type) {
  $task = $asTask.MakeGenericMethod($type).Invoke($null, @($operation))
  $task.Wait(-1) | Out-Null
  $task.Result
}

function Pick-OneCore([string]$lang) {
  $all = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.Language -like "$lang*" }
  $male = $all | Where-Object { $_.Gender -eq "Male" } | Select-Object -First 1
  if ($male) { return $male }
  return $null
}

$winrt = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$sapi = New-Object System.Speech.Synthesis.SpeechSynthesizer
$list = Get-Content -Raw -Encoding UTF8 $Jobs | ConvertFrom-Json

foreach ($job in $list) {
  $voice = Pick-OneCore $job.lang
  if ($voice) {
    $winrt.Voice = $voice
    $stream = Await ($winrt.SynthesizeTextToStreamAsync($job.text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
    $source = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
    $file = [System.IO.File]::Create($job.out)
    $source.CopyTo($file)
    $file.Close()
    $source.Close()
    Write-Output "$($voice.DisplayName) -> $($job.out)"
  }
  else {
    $installed = $sapi.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like "$($job.lang)*" }
    $pick = ($installed | Where-Object { $_.VoiceInfo.Gender -eq "Male" } | Select-Object -First 1)
    if (-not $pick) { $pick = $installed | Select-Object -First 1 }
    if (-not $pick) { throw "Aucune voix installée pour la langue $($job.lang)" }
    $sapi.SelectVoice($pick.VoiceInfo.Name)
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    $sapi.SetOutputToWaveFile($job.out, $format)
    $sapi.Speak($job.text)
    $sapi.SetOutputToNull()
    Write-Output "$($pick.VoiceInfo.Name) -> $($job.out)"
  }
}
