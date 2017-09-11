#
# the idea is to create color histogram for each file and scan for non-gray colors, i.e.
# /RRGGBB/g where !(RR == GG == BB)
#

Dir['*-logo'].each do |fn|
	out=`convert "#{fn}" -define histogram:unique-colors=true -format %c histogram:info:-`
	re=/#....../
	gray=true
	begin
		m=re.match(out)
		gray=m && m[0].match(/#(..)\1\1/)
	end while re && gray
	final_gray=!!re
	puts final_gray?"GRAY #{fn}":"COLOR #{fn}"
end
