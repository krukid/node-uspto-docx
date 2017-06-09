Param(
  [string]$image
)

docker build -t "$image" .
