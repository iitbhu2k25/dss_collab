from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Well
from .serializers import WellSerializer

class WellsAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if 'village_code' not in request.data or not request.data['village_code']:
            return Response({"error": "village_code is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        wells = Well.objects.filter(village_code__in=request.data['village_code'])
        serial = WellSerializer(wells, many=True)
        sorted_data = sorted(serial.data, key=lambda x: x['HYDROGRAPH'])
        return Response(sorted_data, status=status.HTTP_200_OK)