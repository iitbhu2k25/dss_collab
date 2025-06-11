from fastapi import APIRouter
from app.database.config.dependency import db_dependency
from app.api.service.spt_service import Stp_service
from fastapi import HTTPException,status
from app.api.schema.stp_schema import  STPCategory,STPSutabilityInput,category_raster
from app.api.service.stp_operation import STPPriorityMapper,STPSutabilityMapper
router=APIRouter()

@router.post("/stp_priority")
def stp_raster(db:db_dependency,payload: STPCategory):
    try:
        if len(payload.data)==0:
            raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No data found"
        )
        raster_path,raster_weights=Stp_service.get_raster(db,payload)
        return STPPriorityMapper().create_priority_map(raster_path,raster_weights,payload.clip,payload.place)

    except Exception as e:
        print("exception is ",e)
    

    
@router.post("/stp_sutability")
def stp_classify(db:db_dependency,payload:STPSutabilityInput):
    try:
        return STPSutabilityMapper().create_sutability_map(db,payload,reverse=True)
    except Exception as e:
        print("exception",e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.post("/stp_visual_display")
def stp_priority_raster_dislay(db:db_dependency,payload:category_raster):
    try:
        return STPPriorityMapper().category_priority_map(db,payload.clip,payload.place)
    except Exception as e:
        print("exception",e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/stp_sutability_visual_display")
def stp_priority_raster_dislay(db:db_dependency,payload:category_raster):
    try:
        return STPPriorityMapper().category_priority_map_villages(db,payload.clip)
    except Exception as e:
        print("exception",e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

