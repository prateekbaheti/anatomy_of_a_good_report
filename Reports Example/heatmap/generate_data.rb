25.times do |index|
  10.times do |scn_count|
    puts "#{index+1},scenario #{scn_count+1}," + ["pass","fail"][rand(2)]
  end
end
