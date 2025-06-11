import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
from app.api.service.script_svc.geoserver_svc import create_workspace,create_vector_stores,upload_shapefile
state_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp', 'state', 'STP_State.zip')
district_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp', 'district', 'STP_district.zip')
subdistrict_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp', 'subdistrict', 'STP_subdistrict.zip')
villages_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp', 'villages', 'STP_Village.zip')
river_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'River', 'Rivers.zip')
# catchment_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'Catchment', 'Catchment.zip')
stretch_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'Stretches', 'Stretches.zip')
drain_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'Drains', 'Drain.zip')
boundry_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'Boundary', 'Boundary.zip')
town_zip = os.path.join(BASE_DIR, 'media', 'Rajat_data', 'shape_stp','Drain_stp', 'Town', 'Town.zip')
try:
    create_workspace("vector_work")
    create_vector_stores("vector_work","stp_vector_store")
    upload_shapefile("vector_work","stp_vector_store",state_zip,"STP_state_layers")
    upload_shapefile("vector_work","stp_vector_store",district_zip,"STP_district_layers")
    upload_shapefile("vector_work","stp_vector_store",subdistrict_zip,"STP_subdistrict_layers")
    upload_shapefile("vector_work","stp_vector_store",villages_zip,"STP_villages_layers")
    upload_shapefile("vector_work","stp_vector_store",river_zip,"Rivers")
    upload_shapefile("vector_work","stp_vector_store",stretch_zip,"Stretches")
    upload_shapefile("vector_work","stp_vector_store",drain_zip,"Drain")
    upload_shapefile("vector_work","stp_vector_store",boundry_zip,"Boundary")
    upload_shapefile("vector_work","stp_vector_store",town_zip,"Town")
    
    # now upload the shape file in geoserver

except Exception as e:
    print(e)
