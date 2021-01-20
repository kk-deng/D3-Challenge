// Loading the file path
var filepath = "../assets/data/data.csv"

d3.csv(filepath).then(data => {
    console.log(data)
})