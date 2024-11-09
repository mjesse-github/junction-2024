import openeo
import openeo.processes
import numpy as np
import matplotlib.pyplot as plt
import xarray as xr
import matplotlib.patches as mpatches
from rasterio.plot import show

# Connect to Copernicus Data Space
connection = openeo.connect("openeo.dataspace.copernicus.eu").authenticate_oidc()

# Define area of interest (example coordinates)
aoi = {
    
    "type": "Polygon",
    "coordinates": [[
        [48.325487506118264, 28.742803969343313],
        [48.325487506118264, 28.414218984218607],
        [48.75387693420447, 28.414218984218607],
        [48.75387693420447, 28.742803969343313],
        [48.325487506118264, 28.742803969343313],
    ]]
}

# Load Sentinel-1 data
s1_image = connection.load_collection(
    "SENTINEL1_GRD",
    temporal_extent=["2023-01-01", "2023-01-04"],  # Adjust dates as needed
    spatial_extent=aoi,
    bands=["VV"]
)

# Apply SAR backscatter processing
s1_image = s1_image.sar_backscatter(coefficient="sigma0-ellipsoid")

# Normalize backscatter values using log10
s1_image = s1_image.apply(process=lambda data: 10 * openeo.processes.log(data, base=10))

# Define adaptive thresholding window
filter_window = np.ones([601, 601])
factor = 1 / np.prod(filter_window.shape)

# Calculate thresholds
thresholds = s1_image.apply_kernel(kernel=filter_window, factor=factor)

# Apply threshold shift (can be adjusted based on requirements)
threshold_shift = 3.5
thresholds = thresholds - threshold_shift
thresholds = thresholds.rename_labels(dimension="bands", target=["threshold"])

# Prepare for comparison
s1_image = s1_image.rename_labels(dimension="bands", target=["amplitude"])
s1_image = s1_image.merge_cubes(thresholds)

# Detect oil spills (binary classification)
oil_spill = s1_image.band("amplitude") < s1_image.band("threshold")

# Execute the workflow and save results
oil_spill.execute_batch(title="Oil Spill Detection", outputfile="oil_spill_result.nc")


# Load and visualize results
result = xr.load_dataset("oil_spill_result.nc")
data = result[["var"]].to_array(dim="bands")

# Create visualization
cmap = plt.cm.get_cmap('binary')
values = ["No Oil", "Oil Present"]
colors = ["black", "#FFFFED"]

oil_spill_array = data.squeeze().values[600:-600, 600:-600]
fig, ax = plt.subplots(figsize=(10, 10))

ax.imshow(oil_spill_array, vmin=0, vmax=1, cmap=cmap)
ax.set_title("Oil Spill Detection Results")

# Add legend
patches = [mpatches.Patch(color=colors[i], label=values[i]) for i in range(len(values))]
plt.legend(handles=patches, bbox_to_anchor=(1.05, 1), loc=2)
plt.axis('off')
plt.show()