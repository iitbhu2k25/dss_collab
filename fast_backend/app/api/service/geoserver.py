import requests
from requests.auth import HTTPBasicAuth
import os
from app.conf.settings import Settings
import rasterio
import numpy as np
import colorsys
from xml.dom import minidom
from xml.etree import ElementTree as ET
from datetime import datetime
from app.api.service.network.network_conf import GeoConfig
import time

input_path=f"{Settings().BASE_DIR}"+"/temp/input"
output_path=f"{Settings().BASE_DIR}"+"/temp/output"
raster_workspace="vector_work"
raster_store="stp_raster_store"


# def generate_dynamic_sld(raster_path, num_classes, output_sld_path=None, color_ramp='blue_to_red'):
#     with rasterio.open(raster_path) as src:
       
#         data = src.read(1, masked=True)
        
#         # Get min and max values, ignoring NaN and no-data values
#         valid_data = data[~data.mask]
#         if len(valid_data) == 0:
#             raise ValueError("Raster contains no valid data")
        
#         min_val = float(np.min(valid_data))
#         max_val = float(np.max(valid_data))
    
#     print(f"Raster min value: {min_val}, max value: {max_val}")
    
#     # Generate intervals based on min/max values
#     if min_val == max_val:
#         # Handle case where min equals max (constant raster)
#         intervals = [min_val] * num_classes
#     else:
#         # Create evenly spaced intervals
#         intervals = np.linspace(min_val, max_val, num_classes)
    
#     # Generate colors based on the specified color ramp
#     colors = generate_colors(num_classes, color_ramp)
    
#     # Generate SLD XML content
#     sld_content = generate_sld_xml(intervals, colors)
    
#     # Save the SLD file
#     if output_sld_path is None:
#         base, _ = os.path.splitext(raster_path)
#         output_sld_path = f"{base}.sld"
    
#     with open(output_sld_path, 'w', encoding='utf-8') as f:
#         f.write(sld_content)
    
#     print(f"SLD file created: {output_sld_path}")
#     return output_sld_path

# def generate_colors(num_classes, color_ramp='blue_to_red'):
#     """Generate a list of color hex codes for the specified number of classes"""
#     colors = []
    
#     if color_ramp == 'blue_to_red':
#         # Blue to Red gradient
#         for i in range(num_classes):
#             # Calculate interpolation factor (0 to 1)
#             t = i / max(1, num_classes - 1)
            
#             if t < 0.5:
#                 # Blue to Green transition (first half)
#                 r = int(0 + t * 2 * 255)  # 0 to 255
#                 g = int(0 + t * 2 * 255)  # 0 to 255
#                 b = 255                   # Stay at 255
#             else:
#                 # Green to Red transition (second half)
#                 r = 255                               # Stay at 255
#                 g = int(255 - (t - 0.5) * 2 * 255)    # 255 to 0
#                 b = int(255 - (t - 0.5) * 2 * 255)    # 255 to 0
                
#             hex_color = f"#{r:02x}{g:02x}{b:02x}"
#             colors.append(hex_color.upper())
    
#     elif color_ramp == 'viridis':
#         # Approximation of viridis colormap
#         viridis_anchors = [
#             (68, 1, 84),    # Dark purple
#             (59, 82, 139),   # Purple
#             (33, 144, 140),  # Teal
#             (93, 201, 99),   # Green
#             (253, 231, 37)   # Yellow
#         ]
        
#         for i in range(num_classes):
#             t = i / max(1, num_classes - 1)
#             idx = min(int(t * (len(viridis_anchors) - 1)), len(viridis_anchors) - 2)
#             interp = t * (len(viridis_anchors) - 1) - idx
            
#             r = int(viridis_anchors[idx][0] * (1 - interp) + viridis_anchors[idx + 1][0] * interp)
#             g = int(viridis_anchors[idx][1] * (1 - interp) + viridis_anchors[idx + 1][1] * interp)
#             b = int(viridis_anchors[idx][2] * (1 - interp) + viridis_anchors[idx + 1][2] * interp)
            
#             hex_color = f"#{r:02x}{g:02x}{b:02x}"
#             colors.append(hex_color.upper())
    
#     elif color_ramp == 'terrain':
#         # Approximation of terrain colormap
#         terrain_anchors = [
#             (0, 0, 92),      # Dark blue
#             (0, 128, 255),   # Light blue
#             (0, 255, 128),   # Light green
#             (255, 255, 0),   # Yellow
#             (128, 64, 0),    # Brown
#             (255, 255, 255)  # White
#         ]
        
#         for i in range(num_classes):
#             t = i / max(1, num_classes - 1)
#             idx = min(int(t * (len(terrain_anchors) - 1)), len(terrain_anchors) - 2)
#             interp = t * (len(terrain_anchors) - 1) - idx
            
#             r = int(terrain_anchors[idx][0] * (1 - interp) + terrain_anchors[idx + 1][0] * interp)
#             g = int(terrain_anchors[idx][1] * (1 - interp) + terrain_anchors[idx + 1][1] * interp)
#             b = int(terrain_anchors[idx][2] * (1 - interp) + terrain_anchors[idx + 1][2] * interp)
            
#             hex_color = f"#{r:02x}{g:02x}{b:02x}"
#             colors.append(hex_color.upper())
            
#     elif color_ramp == 'spectral':
#         # Approximation of spectral colormap (red to blue)
#         spectral_anchors = [
#             (213, 62, 79),    # Red
#             (253, 174, 97),   # Orange
#             (254, 224, 139),  # Yellow
#             (230, 245, 152),  # Light yellow-green
#             (171, 221, 164),  # Light green
#             (102, 194, 165),  # Teal
#             (50, 136, 189)    # Blue
#         ]
        
#         for i in range(num_classes):
#             t = i / max(1, num_classes - 1)
#             idx = min(int(t * (len(spectral_anchors) - 1)), len(spectral_anchors) - 2)
#             interp = t * (len(spectral_anchors) - 1) - idx
            
#             r = int(spectral_anchors[idx][0] * (1 - interp) + spectral_anchors[idx + 1][0] * interp)
#             g = int(spectral_anchors[idx][1] * (1 - interp) + spectral_anchors[idx + 1][1] * interp)
#             b = int(spectral_anchors[idx][2] * (1 - interp) + spectral_anchors[idx + 1][2] * interp)
            
#             hex_color = f"#{r:02x}{g:02x}{b:02x}"
#             colors.append(hex_color.upper())
    
#     else:
#         # Default to blue to red if unknown color ramp
#         return generate_colors(num_classes, 'blue_to_red')
        
#     return colors

# def generate_sld_xml(intervals, colors):
#     """Generate the SLD XML content with the specified intervals and colors"""
#     # Create the root element
#     root = ET.Element("StyledLayerDescriptor")
#     root.set("xmlns", "http://www.opengis.net/sld")
#     root.set("xmlns:ogc", "http://www.opengis.net/ogc")
#     root.set("xmlns:xlink", "http://www.w3.org/1999/xlink")
#     root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
#     root.set("xsi:schemaLocation", "http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd")
#     root.set("version", "1.0.0")
    
#     # Create user layer
#     user_layer = ET.SubElement(root, "UserLayer")
#     name = ET.SubElement(user_layer, "Name")
#     name.text = "raster_layer"
    
#     # Create user style
#     user_style = ET.SubElement(user_layer, "UserStyle")
#     style_name = ET.SubElement(user_style, "Name")
#     style_name.text = "raster"
    
#     title = ET.SubElement(user_style, "Title")
#     title.text = f"{len(colors)}-Class Raster Style"
    
#     abstract = ET.SubElement(user_style, "Abstract")
#     abstract.text = f"A style for rasters with {len(colors)} distinct classes"
    
#     # Create feature type style
#     feature_type_style = ET.SubElement(user_style, "FeatureTypeStyle")
#     feature_type_name = ET.SubElement(feature_type_style, "FeatureTypeName")
#     feature_type_name.text = "Feature"
    
#     rule = ET.SubElement(feature_type_style, "Rule")
    
#     # Create raster symbolizer
#     raster_symbolizer = ET.SubElement(rule, "RasterSymbolizer")
    
#     opacity = ET.SubElement(raster_symbolizer, "Opacity")
#     opacity.text = "1.0"
    
#     # Create color map
#     color_map = ET.SubElement(raster_symbolizer, "ColorMap")
#     color_map.set("type", "intervals")
    
#     # Add color map entries
#     for i, (interval, color) in enumerate(zip(intervals, colors)):
#         color_map_entry = ET.SubElement(color_map, "ColorMapEntry")
#         color_map_entry.set("color", color)
#         color_map_entry.set("quantity", str(interval))
#         color_map_entry.set("label", f"Class {i+1}")
    
#     # Convert to string with pretty printing
#     rough_string = ET.tostring(root, encoding='utf-8')
#     reparsed = minidom.parseString(rough_string)
#     pretty_xml = reparsed.toprettyxml(indent="\t")
    
#     # Fix XML declaration to match requested format
#     pretty_xml = '<?xml version="1.0" encoding="utf-8"?>\n' + '\n'.join(pretty_xml.split('\n')[1:])
    
#     return pretty_xml

# def apply_sld_to_layer(self,workspace_name, layer_name, sld_content, sld_name=None):
    
#         if sld_name is None:
#             sld_name = layer_name+datetime.now().strftime("%Y%m%d%H%M%S")
        
#             # Create a simple SLD for raster with the jet color ramp manually
#             new_sld_content=""
#             with open(sld_content, "r") as f:
#                 new_sld_content = f.read()
        
#         styles_url = f"{geoserver_url}/rest/workspaces/{workspace_name}/styles"
#         style_data = {
#             "style": {
#                 "name": sld_name,
#                 "filename": f"{sld_name}.sld"
#             }
#         }
        
#         # Check if style already exists
#         style_url = f"{styles_url}/{sld_name}"
#         check_response = requests.get(
#             style_url,
#             auth=HTTPBasicAuth(username, password)
#         )
        
#         if check_response.status_code != 200:
#             # Style doesn't exist, create it
#             print(f"Creating new style metadata: {sld_name}")
#             create_response = requests.post(
#                 styles_url,
#                 json=style_data,
#                 auth=HTTPBasicAuth(username, password),
#                 headers={"Content-Type": "application/json"}
#             )
            
#             if create_response.status_code not in [200, 201]:
#                 print(f"Failed to create style metadata: {create_response.status_code}, {create_response.text}")
#                 return False
        
#         # Now upload the SLD content 
#         print(f"Uploading SLD content for style: {sld_name}")
#         upload_response = requests.put(
#             style_url,
#             data=new_sld_content,
#             auth=HTTPBasicAuth(username, password),
#             headers={"Content-Type": "application/vnd.ogc.sld+xml"}
#         )
        
#         if upload_response.status_code not in [200, 201]:
#             print(f"Failed to upload SLD content: {upload_response.status_code}, {upload_response.text}")
#             return False
        
#         print(f"Successfully uploaded SLD content")
        
#         # Now apply the style to the layer
#         layer_url = f"{geoserver_url}/rest/workspaces/{workspace_name}/layers/{layer_name}"
#         payload = {
#         "layer": {
#             "defaultStyle": {
#                 "name": sld_name
#             }
#         }
#         }

#         apply_response = requests.put(
#             layer_url,
#             json=payload,  # This will serialize the payload as JSON
#             auth=HTTPBasicAuth(username, password),
#             headers={"Content-Type": "application/json"}
#         )
            
#         if apply_response.status_code not in [200, 201]:
#             print(f"Failed to apply style to layer: {apply_response.status_code}, {apply_response.text}")
#             return False
#         print(f"Successfully applied style to layer")
#         return True
    

# def create_workspace(workspace_name):
#     try:
#         check_url = f"{geoserver_url}/rest/workspaces/{workspace_name}"
#         check_response = requests.get(
#             check_url,
#             auth=HTTPBasicAuth(username, password)
#         )
#         if check_response.status_code == 200:
#             print(f"Workspace '{workspace_name}' already exists")
#             return True

#         workspace_url = f"{geoserver_url}/rest/workspaces"
#         headers = {"Content-type": "application/json"}
#         data = {"workspace": {"name": workspace_name}}

#         response = requests.post(
#             workspace_url,
#             auth=HTTPBasicAuth(username, password),
#             json=data,
#             headers=headers
#         )
#         if response.status_code == 201:
#             print("workspace is created successfully")
#             wfs_url = f"{geoserver_url}/rest/services/wfs/workspaces/{workspace_name}/settings"
#             headers = {"Content-type": "application/json"}
#             wfs_data = {
#                 "wfs": {
#                     "enabled": True,
#                     "name": f"{workspace_name}_WFS",
#                     "workspace": {"name": workspace_name}
#                 }
#             }
                
#             wfs_response = requests.put(
#                 wfs_url,
#                 auth=HTTPBasicAuth(username, password),
#                 json=wfs_data,
#                 headers=headers
#             )
                
#             if wfs_response.status_code in (200, 201):
#                 print(f"WFS service enabled for workspace '{workspace_name}'")
#             else:
#                 print(f"Failed to enable WFS service. Status code: {wfs_response.status_code}")
#                 print(f"Response: {wfs_response.text}")
            
#             wms_url = f"{geoserver_url}/rest/services/wms/workspaces/{workspace_name}/settings"
#             headers = {"Content-type": "application/json"}
#             wms_data = {
#                 "wms": {
#                     "enabled": True,
#                     "name": f"{workspace_name}_WMS",
#                     "workspace": {"name": workspace_name}
#                 }
#             }
                
#             wms_response = requests.put(
#                 wms_url,
#                 auth=HTTPBasicAuth(username, password),
#                 json=wms_data,
#                 headers=headers
#             )
                
#             if wms_response.status_code in (200, 201):
#                 print(f"WMS service enabled for workspace '{workspace_name}'")
#             else:
#                 print(f"Failed to enable WMS service. Status code: {wms_response.status_code}")
#                 print(f"Response: {wms_response.text}")
            
#             return True
#         else:
#             print("Failed to create workspace")
#             return False
#     except Exception as e:  
#        print(e)
#        return False

# def create_raster_stores(workspace_name, store_name):
#     check_url = f"{geoserver_url}/rest/workspaces/{workspace_name}/datastores/{store_name}"
    
#     check_response = requests.get(
#         check_url,
#         auth=HTTPBasicAuth(username, password)
#     )
    
#     if check_response.status_code == 200:
#         print(f"Store '{store_name}' already exists in workspace '{workspace_name}'")
#         return True
    
#     create_shapefile_store(workspace_name,store_name,geoserver_url)

class Geoserver:
    def __init__(self, config: GeoConfig =GeoConfig()):

        self.geoserver_url = config.geoserver_url
        self.username = config.username
        self.password = config.password
        self.geoserver_external_url = config.geoserver_external_url  # Corrected the typo
        self.wcs_url = f"{self.geoserver_url}/wcs"
        self.wms_url = f"{self.geoserver_url}/wms"
        self.wfs_url = f"{self.geoserver_url}/wfs"
        self.temp_dir = config.output_path

    def raster_download(self,workspace_name,store_name,layer_name,legends=5):
        geoserver_wcs_url = (f"{self.wcs_url}"
                    f"?service=WCS"
                    f"&version=2.0.1"
                    f"&request=GetCoverage"
                    f"&coverageId={layer_name}"
                    f"&format=image/geotiff"
                )

        r = requests.get(geoserver_wcs_url
                    , auth=HTTPBasicAuth(self.username, self.password),cookies={})
        print(r.status_code)
        if r.status_code == 200:
            filename = layer_name.split(":")[-1] + ".tif"
            file_path = os.path.join(self.temp_dir, filename)
            with open(file_path, "wb") as f:
                f.write(r.content)
            return file_path
        
        
    def apply_sld_to_layer(self,workspace_name, layer_name, sld_content, sld_name=None):
        if sld_name is None:
            sld_name = layer_name+datetime.now().strftime("%Y%m%d%H%M%S")
        

        new_sld_content=""
        with open(sld_content, "r") as f:
            new_sld_content = f.read()
        
        styles_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/styles"
        style_data = {
            "style": {
                "name": sld_name,
                "filename": f"{sld_name}.sld"
            }
        }
        
        style_url = f"{styles_url}/{sld_name}"
        check_response = requests.get(
            style_url,
            auth=HTTPBasicAuth(self.username, self.password)
        )
        
        if check_response.status_code != 200:
            # Style doesn't exist, create it
            print(f"Creating new style metadata: {sld_name}")
            create_response = requests.post(
                styles_url,
                json=style_data,
                auth=HTTPBasicAuth(self.username, self.password),
                headers={"Content-Type": "application/json"}
            )
            
            if create_response.status_code not in [200, 201]:
                print(f"Failed to create style metadata: {create_response.status_code}, {create_response.text}")
                return False
        
        # Now upload the SLD content 
        print(f"Uploading SLD content for style: {sld_name}")
        upload_response = requests.put(
            style_url,
            data=new_sld_content,
            auth=HTTPBasicAuth(self.username, self.password),
            headers={"Content-Type": "application/vnd.ogc.sld+xml"}
        )
        
        if upload_response.status_code not in [200, 201]:
            print(f"Failed to upload SLD content: {upload_response.status_code}, {upload_response.text}")
            return False
        
        print(f"Successfully uploaded SLD content")
        
        # Now apply the style to the layer
        layer_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/layers/{layer_name}"
        payload = {
        "layer": {
            "defaultStyle": {
                "name": sld_name
            }
        }
        }

        apply_response = requests.put(
            layer_url,
            json=payload,  # This will serialize the payload as JSON
            auth=HTTPBasicAuth(self.username, self.password),
            headers={"Content-Type": "application/json"}
        )
            
        if apply_response.status_code not in [200, 201]:
            print(f"Failed to apply style to layer: {apply_response.status_code}, {apply_response.text}")
            return False
        print(f"Successfully applied style to layer")
        return True
  
    
    def publish_raster(self, workspace_name, store_name, raster_path):
        try:
            layer_name = os.path.splitext(os.path.basename(raster_path))[0]
            file_extension = os.path.splitext(raster_path)[1].lower()
            content_type = "image/tiff"
            store_type = "GeoTIFF"
            api_extension = "file.geotiff"
            
            # Check if workspace exists, create if not
            check_workspace_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}"
            check_workspace_response = requests.get(
                check_workspace_url,
                auth=HTTPBasicAuth(self.username, self.password)
            )
            
            if check_workspace_response.status_code != 200:
                print(f"Workspace '{workspace_name}' does not exist. Creating it...")
                create_workspace_url = f"{self.geoserver_url}/rest/workspaces"
                create_workspace_data = {
                    "workspace": {
                        "name": workspace_name
                    }
                }
                
                create_workspace_response = requests.post(
                    create_workspace_url,
                    auth=HTTPBasicAuth(self.username, self.password),
                    json=create_workspace_data,
                    headers={"Content-type": "application/json"}
                )
                
                if create_workspace_response.status_code not in (200, 201):
                    print(f"Failed to create workspace. Status code: {create_workspace_response.status_code}")
                    print(f"Response: {create_workspace_response.text}")
                    return False
                
                print(f"Workspace '{workspace_name}' created successfully")

                # Ensure WMS service is enabled for the workspace
                wms_settings_url = f"{self.geoserver_url}/rest/services/wms/workspaces/{workspace_name}/settings"
                wms_settings_data = {
                    "wms": {
                        "enabled": True,
                        "name": f"{workspace_name}_wms"
                    }
                }
                
                wms_settings_response = requests.put(
                    wms_settings_url,
                    auth=HTTPBasicAuth(self.username, self.password),
                    json=wms_settings_data,
                    headers={"Content-type": "application/json"}
                )
                
                if wms_settings_response.status_code not in (200, 201):
                    print(f"Warning: Failed to enable WMS for workspace. Status code: {wms_settings_response.status_code}")
                    print(f"Response: {wms_settings_response.text}")

            # Check if coverage store exists
            check_store_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores/{store_name}"    
            check_store_response = requests.get(
                check_store_url,
                auth=HTTPBasicAuth(self.username, self.password)
            )
            
            # If store exists, delete it completely to avoid duplicates
            if check_store_response.status_code == 200:
                print(f"Coverage store '{store_name}' exists. Deleting it to avoid duplicates...")
                delete_store_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores/{store_name}?recurse=true"
                delete_store_response = requests.delete(
                    delete_store_url,
                    auth=HTTPBasicAuth(self.username, self.password)
                )
                
                if delete_store_response.status_code == 200:
                    print(f"Existing coverage store '{store_name}' deleted successfully")
                else:
                    print(f"Warning: Failed to delete existing store. Status code: {delete_store_response.status_code}")

            # Create new coverage store
            print(f"Creating new coverage store '{store_name}' in workspace '{workspace_name}'...")
            create_store_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores"
            create_store_data = {
                "coverageStore": {
                    "name": store_name,
                    "type": store_type,
                    "enabled": True,
                    "workspace": {
                        "name": workspace_name
                    }
                }
            }
            
            create_response = requests.post(
                create_store_url,
                auth=HTTPBasicAuth(self.username, self.password),
                json=create_store_data,
                headers={"Content-type": "application/json"}
            )
            
            if create_response.status_code not in (200, 201):
                print(f"Failed to create coverage store. Status code: {create_response.status_code}")
                print(f"Response: {create_response.text}")
                return False
                
            print(f"Coverage store '{store_name}' created successfully")

            # Upload raster file with configure=first to avoid auto-creation of duplicate coverages
            upload_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores/{store_name}/{api_extension}?configure=first"
            
            headers = {"Content-type": content_type}
            with open(raster_path, 'rb') as f:
                data = f.read()
            
            print("Data size:", len(data))
            print(f"Uploading raster to store '{store_name}'...")
            
            response = requests.put(
                upload_url,
                auth=HTTPBasicAuth(self.username, self.password),
                data=data,
                headers=headers
            )
            
            if response.status_code in (200, 201):
                print(f"Raster file uploaded successfully to store '{store_name}'")
                
                # Now create the coverage/layer explicitly
                configure_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores/{store_name}/coverages"
                
                coverage_data = {
                    "coverage": {
                        "name": layer_name,
                        "title": layer_name,
                        "enabled": True,
                        "metadata": {
                            "entry": [
                                {
                                    "@key": "wms.published",
                                    "$": "true"
                                }
                            ]
                        }
                    }
                }
                
                configure_response = requests.post(
                    configure_url,
                    auth=HTTPBasicAuth(self.username, self.password),
                    json=coverage_data,
                    headers={"Content-type": "application/json"}
                )
                
                if configure_response.status_code in (200, 201):
                    print(f"Coverage layer '{layer_name}' created and configured successfully")
                else:
                    print(f"Warning: Failed to create coverage layer. Status code: {configure_response.status_code}")
                    print(f"Response: {configure_response.text}")
                    
                    # Try to get automatically created coverage if manual creation failed
                    auto_coverage_url = f"{self.geoserver_url}/rest/workspaces/{workspace_name}/coveragestores/{store_name}/coverages"
                    auto_coverage_response = requests.get(
                        auto_coverage_url,
                        auth=HTTPBasicAuth(self.username, self.password)
                    )
                    
                    if auto_coverage_response.status_code == 200:
                        coverages = auto_coverage_response.json()
                        if 'coverage' in coverages or 'coverages' in coverages:
                            print(f"Found automatically created coverage in store '{store_name}'")
                
                # Verify the layer exists and is accessible
                verify_url = f"{self.geoserver_url}/rest/layers/{workspace_name}:{layer_name}"
                verify_response = requests.get(
                    verify_url,
                    auth=HTTPBasicAuth(self.username, self.password)
                )
                
                if verify_response.status_code == 200:
                    print(f"Layer '{layer_name}' has been published and is available via WMS")
                    
                    # Output WMS endpoint info
                    wms_url = f"{self.geoserver_url}/wms?service=WMS&version=1.1.0&request=GetMap&layers={workspace_name}:{layer_name}"
                    print(f"WMS endpoint: {wms_url}")
                    
                    return True, layer_name
                else:
                    print(f"Warning: Could not verify layer configuration: {verify_response.status_code}")
                    return True, layer_name  # Upload was successful even if verification failed
                    
            else:
                print(f"Failed to upload raster file. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Error uploading raster file: {str(e)}")
            return False