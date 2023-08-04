function actualOutsideDiameter_Cal(pipe_size){
    var pipesize_float = parseFloat(pipe_size)
    var ggg = [
        [0.125,10.3],[0.25,13.7],[0.357,17.1],[0.5,21.3],[0.75,26.7],[1,33.4],[1.25,42.2],
        [1.5,48.3],[2,60.3],[2.5,73],[3,88.9],[3.5,101.6],[4,114.3],[5,141.3],
        [6,168.3],[8,219.1],[10,273],[12,323.8],[14,355.6],[16,406.4],[18,457]
    ]

    for(var i = 0;i<ggg.length;i++){
        if(pipesize_float == ggg[i][0])return ggg[i][1]
    }

    return -1
}

function designThickness_Cal(design_pressure,actual_outside_diameter,stress,joint_efficiency){
    var dp = parseFloat(design_pressure)
    var aod = parseFloat(actual_outside_diameter)
    var stre = parseFloat(stress)
    var je = parseFloat(joint_efficiency)
    return (dp * aod) / ((2 * stre * je) + (2 * dp * 0.4))
}

function structuralThickness_Cal(pipe_size){
    var pipe_size_float = parseFloat(pipe_size)
    if(pipe_size_float <= 2) return 1.8
    else if(pipe_size_float === 3)return 2.0
    else if(pipe_size_float === 4) return 2.3
    else if(pipe_size_float >= 6 && pipe_size_float <= 18)return 2.8
    else if(pipe_size_float >= 20)return 3.1
    else return 0
}

function requiredThickness_Cal(design_thickness,structural_thickness){
    const number = [parseFloat(design_thickness),parseFloat(structural_thickness)]
    return Math.max(...number)
}


module.exports = {
    actualOutsideDiameter_Cal,
    designThickness_Cal,
    structuralThickness_Cal,
    requiredThickness_Cal
}