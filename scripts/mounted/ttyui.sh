#!/bin/bash

tput clear

echo Foo
echo Bar
echo Baz

tput cup 3 0
printf "%$(tput cols)s\n" | tr ' ' -

i=0
while true; do
  
  i=$((i + 1))

  tput cup 0 10; echo -n a$i
  tput cup 1 10; echo -n b$i
  tput cup 2 10; echo -n c$i

  tput cup 4 0
  if [[ $((i % 2)) -eq 0 ]]; then
    echo -e "A\nB\nN\nC\nD\nE\nF\nH\nJ\nB\nZ\nK\nL" | head -n $(($(tput lines)-5))
  else
    echo -e -n "X\nT\nB\nG\nA\nF\nL\nP\nQ\nO"
  fi

  sleep 1
done
