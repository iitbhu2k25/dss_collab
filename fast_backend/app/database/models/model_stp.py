import sqlalchemy as sa
from app.database.models.base import Base
from sqlalchemy.orm import Mapped,mapped_column, relationship
from sqlalchemy import Integer, String, Float,ForeignKey
from typing import List

class State(Base):
    __tablename__ = "stp_state"

    state_code: Mapped[int] = mapped_column(Integer, primary_key=True,unique=True, nullable=False)
    state_name: Mapped[str] = mapped_column(String, nullable=False)
    districts: Mapped[List["District"]] = relationship(back_populates="state")

class District(Base):
    __tablename__ = "stp_district"

    district_code: Mapped[int] = mapped_column(Integer, primary_key=True,unique=True,  nullable=False)
    district_name: Mapped[str] = mapped_column(String, nullable=False)
    state_code: Mapped[int] = mapped_column(ForeignKey("stp_state.state_code"), nullable=False)
    state: Mapped["State"] = relationship(back_populates="districts")
    subdistricts: Mapped[List["SubDistrict"]] = relationship(back_populates="district")

class SubDistrict(Base):
    __tablename__ = "stp_subdistrict"

    subdistrict_code: Mapped[int] = mapped_column(Integer, primary_key=True,unique=True,  nullable=False)
    subdistrict_name: Mapped[str] = mapped_column(String, nullable=False)
    district_code: Mapped[int] = mapped_column(ForeignKey("stp_district.district_code"), nullable=False)
    district: Mapped["District"] = relationship(back_populates="subdistricts")
    towns:Mapped[List["Towns"]]= relationship(back_populates='subdistrict')
    
class Towns(Base):
    __tablename__ = "stp_towns"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    classs : Mapped[int] = mapped_column(Integer,  nullable=False)
    population: Mapped[int] = mapped_column(Integer, nullable=False)
    elevation: Mapped[float] = mapped_column(Float, nullable=False)
    subdistrict_code: Mapped[int] = mapped_column(ForeignKey("stp_subdistrict.subdistrict_code"), nullable=False)
    subdistrict: Mapped["SubDistrict"] = relationship(back_populates="towns")



class STP_River(Base):
    __tablename__ = "stp_river"
    River_Code: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True, nullable=False)
    River_Name: Mapped[str] = mapped_column(String, nullable=False) 
    stretches: Mapped[List["STP_Stretches"]] = relationship(back_populates="river")

class STP_Stretches(Base):
    __tablename__ = "stp_stretches"    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    Stretch_ID: Mapped[int] = mapped_column(Integer, nullable=False)  
    river_Code: Mapped[int] = mapped_column(ForeignKey("stp_river.River_Code"), nullable=False)  # Fixed case
    river: Mapped["STP_River"] = relationship(back_populates="stretches")
    drains: Mapped[List["STP_Drain"]] = relationship(back_populates="stretch")

class STP_Drain(Base):
    __tablename__ = "stp_drain"

    Drain_No: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True, nullable=False)
    stretch_id: Mapped[int] = mapped_column(ForeignKey("stp_stretches.id"), nullable=False)  # Renamed for clarity
    stretch: Mapped["STP_Stretches"] = relationship(back_populates="drains")
    catchment: Mapped["STP_Catchment"] = relationship(back_populates="drains")
    River_code: Mapped[int] = mapped_column(Integer, nullable=False)

class STP_Catchment(Base):
    __tablename__ = "stp_catchment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True, nullable=False)
    GRIDCODE: Mapped[int] = mapped_column(Integer, nullable=False)    
    Drain_No: Mapped[int] = mapped_column(ForeignKey("stp_drain.Drain_No"), nullable=False)
    drains: Mapped[List["STP_Drain"]] = relationship(back_populates="catchment")
    
class STP_raster(Base):
    __tablename__='stp_priority_raster'
    file_name:Mapped[str]=mapped_column(String,nullable=False)
    layer_name:Mapped[str]=mapped_column(String,nullable=False)
    weight:Mapped[float]=mapped_column(Float,nullable=False)
    file_path:Mapped[str]=mapped_column(String,nullable=False)

class STP_sutability_raster(Base):
    __tablename__='stp_sutability_raster'
    file_name:Mapped[str]=mapped_column(String,nullable=False)
    layer_name:Mapped[str]=mapped_column(String,nullable=False)
    weight:Mapped[float]=mapped_column(Float,nullable=False)
    file_path:Mapped[str]=mapped_column(String,nullable=False)
    raster_category:Mapped[str]=mapped_column(String,nullable=False)


class STP_Priority_Visual_raster(Base):
    __tablename__='stp_priority_visual_raster'
    file_name:Mapped[str]=mapped_column(String,nullable=False)
    layer_name:Mapped[str]=mapped_column(String,nullable=False)
    file_path:Mapped[str]=mapped_column(String,nullable=False)
    sld_path:Mapped[str]=mapped_column(String,nullable=False)




class STP_sutability_visual_raster(Base):
    __tablename__='stp_sutability_visual_raster'
    file_name:Mapped[str]=mapped_column(String,nullable=False)
    layer_name:Mapped[str]=mapped_column(String,nullable=False)
    file_path:Mapped[str]=mapped_column(String,nullable=False)
    sld_path:Mapped[str]=mapped_column(String,nullable=False)
    raster_category:Mapped[str]=mapped_column(String,nullable=False)