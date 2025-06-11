<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:sld="http://www.opengis.net/sld" version="1.0.0">
  <UserLayer>
    <sld:LayerFeatureConstraints>
      <sld:FeatureTypeConstraint/>
    </sld:LayerFeatureConstraints>
    <sld:UserStyle>
      <sld:Name>Groundwater_Depth</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ChannelSelection>
              <sld:GrayChannel>
                <sld:SourceChannelName>1</sld:SourceChannelName>
              </sld:GrayChannel>
            </sld:ChannelSelection>
            <sld:ColorMap type="intervals">
              <sld:ColorMapEntry label="&lt;= 5.43643" color="#30123b" quantity="5.4364319600000002"/>
              <sld:ColorMapEntry label="5.43643 - 10.35133" color="#28bceb" quantity="10.351330819999999"/>
              <sld:ColorMapEntry label="10.35133 - 15.26623" color="#a4fc3c" quantity="15.266229679999999"/>
              <sld:ColorMapEntry label="15.26623 - 20.18113" color="#fb7e21" quantity="20.18112854"/>
              <sld:ColorMapEntry label="> 20.18113" color="#7a0403" quantity="inf"/>
            </sld:ColorMap>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </UserLayer>
</StyledLayerDescriptor>
