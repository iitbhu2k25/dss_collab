from pydantic import BaseModel
from typing import Annotated,List


class Stp_response(BaseModel):
    id:int
    name:str
    
    class Config:
        from_attributes = True

class Stp_town_respons(Stp_response):
    population:int
    classs :int

class District_request(BaseModel):
    state:int
    all_data: bool = True
    
    class Config:
        from_attributes = True
    
class Sub_district_request(BaseModel):
    districts:Annotated[List[int],None]
    all_data: bool = True
    
    class Config:
        from_attributes = True



class STPPriorityInput(BaseModel):
    file_name: str
    weight: float


class STPCategory(BaseModel):
    data: List[STPPriorityInput] = None
    clip: List[int] = None
    all_data: bool = True
    place: str = None
    class Config:
        from_attributes = True

    
class STPRasterInputt(BaseModel):
    id: int
    weight: float

class STPClassification(BaseModel):
    workspace:str
    store:str
    layer_name:str
    
    class Config:
        from_attributes = True


class STP_sutability(BaseModel):
    file_name: str
    Influence: str
    weight: float  

    class Config:
        from_attributes = True

class STPSutabilityInput(BaseModel):
    data: List[STP_sutability] = None
    clip: List[int] = None
    all_data: bool = True
    class Config:
        from_attributes = True

class STPPriorityOutput(BaseModel):
    weight: float
    file_name: str
    id: int 

    class Config:
        from_attributes = True

class STPSutabilityOutput(STPPriorityOutput):
    raster_category: str  

    class Config:
        from_attributes = True

class category_raster(BaseModel):
    clip:List[int]=None
    place:str=None

class STPRiverOutput(BaseModel):
    River_Name: str
    River_Code:int

class STPStretchesOutput(BaseModel):
    Stretch_ID: int
    id:int
    river_Code:int

class STPDrainOutput(BaseModel):
    Drain_No: int
    stretch_id:int
    id:int
    River_code:int

class cachement_village(BaseModel):
    id:int
    village_name:str
    area:float

class STPCatchmentOutput(BaseModel):
    data:list[cachement_village]=None
    layer_name:str



class STPStretchesInput(BaseModel):
    river_code: int=None
    all_data: bool = False

class STPDrainInput(BaseModel):
    stretch_ids: Annotated[List[int],None] = None
    all_data: bool = False

class STPCatchmentInput(BaseModel):
    drain_nos: Annotated[List[int],None] = None

class Town_request(BaseModel):
    subdis_code:Annotated[List[int],None] = None
    all_data : bool  = False
    