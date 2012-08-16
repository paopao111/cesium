/*global defineSuite*/
defineSuite([
         'DynamicScene/DynamicPositionProperty',
         'Core/JulianDate',
         'Core/Ellipsoid',
         'Core/Cartesian3',
         'Core/Cartographic'
     ], function(
          DynamicPositionProperty,
          JulianDate,
          Ellipsoid,
          Cartesian3,
          Cartographic) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var cartesianInterval = {
        epoch : '2012-04-18T15:59:00Z',
        cartesian : [0, 100000, 100001, 100002, 3600, 100010, 100011, 100012, 7200, 100020, 100021, 100022],
        interpolationAlgorithm : 'LINEAR',
        interpolationDegree : 1
    };

    var cartographicInterval = {
        cartographicRadians: ['2012-04-18T15:59:00Z', 0.1, 0.2, 1000, '2012-04-18T16:59:00Z', 0.3, 0.4, 500, '2012-04-18T17:59:00Z', 0.5, 0.6, 750],
        interpolationAlgorithm : 'LINEAR',
        interpolationDegree : 1
    };

    var epoch = JulianDate.fromIso8601(cartesianInterval.epoch);

    it('getValueCartesian returns undefined if no data exists', function() {
        var property = new DynamicPositionProperty();
        expect(property.getValueCartesian(new JulianDate())).toBeUndefined();
    });

    it('getValueCartesian throw if no time supplied', function() {
        var property = new DynamicPositionProperty();
        expect(function() {
            property.getValueCartesian();
        }).toThrow();
    });

    it('getValueCartesian works for cartesian data', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianInterval);

        var result = property.getValueCartesian(epoch);
        expect(result.x).toEqual(100000);
        expect(result.y).toEqual(100001);
        expect(result.z).toEqual(100002);
    });

    it('getValueCartographic returns undefined if no data exists', function() {
        var property = new DynamicPositionProperty();
        expect(property.getValueCartographic(new JulianDate())).toBeUndefined();
    });

    it('getValueCartographic throw if no time supplied', function() {
        var property = new DynamicPositionProperty();
        expect(function() {
            property.getValueCartographic();
        }).toThrow();
    });

    it('getValueCartographic works for cartesian data', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianInterval);

        var cartographic = Ellipsoid.WGS84.cartesianToCartographic(property.getValueCartesian(epoch));
        var result = property.getValueCartographic(epoch);
        expect(result.longitude).toEqual(cartographic.longitude);
        expect(result.latitude).toEqual(cartographic.latitude);
        expect(result.height).toEqual(cartographic.height);
    });

    it('getValueCartographic works for cartographic data', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartographicInterval);

        var result = property.getValueCartographic(epoch);
        expect(result.longitude).toEqual(0.1);
        expect(result.latitude).toEqual(0.2);
        expect(result.height).toEqual(1000);
    });

    it('getValueCartesian works for cartographic data', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartographicInterval);

        var cartesian = Ellipsoid.WGS84.cartographicToCartesian(property.getValueCartographic(epoch));
        var result = property.getValueCartesian(epoch);
        expect(result.x).toEqual(cartesian.x);
        expect(result.y).toEqual(cartesian.y);
        expect(result.z).toEqual(cartesian.z);
    });

    it('replacing an interval with data of a different type works', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianInterval);

        var result = property.getValueCartesian(epoch);
        expect(result.x).toEqual(100000);
        expect(result.y).toEqual(100001);
        expect(result.z).toEqual(100002);

        property.processCzmlIntervals(cartographicInterval);

        result = property.getValueCartographic(epoch);
        expect(result.longitude).toEqual(0.1);
        expect(result.latitude).toEqual(0.2);
        expect(result.height).toEqual(1000);
    });

    var cartesian0 = new Cartesian3(0.0, 0.0, 0.0);
    var cartesian1 = new Cartesian3(1.0, 1.0, 1.0);
    var cartesian2 = new Cartesian3(2.0, 2.0, 2.0);

    var cartesianForgetValueRangeCartesian = {
        interval: '2012-08-01T00:00:00Z/2012-08-01T00:00:02Z',
        epoch : '2012-08-01T00:00:00Z',
        cartesian : [0, cartesian0.x, cartesian0.y, cartesian0.z,
                     1, cartesian1.x, cartesian1.y, cartesian1.z,
                     2, cartesian2.x, cartesian2.y, cartesian2.z],
        interpolationAlgorithm : 'LINEAR',
        interpolationDegree : 1
    };

    var cartographic3 = new Cartographic(0.3, 0.3, 0.3);
    var cartographic4 = new Cartographic(0.4, 0.4, 0.4);
    var cartographic5 = new Cartographic(0.5, 0.5, 0.5);

    var cartographicForgetValueRangeCartesian = {
            interval: '2012-08-01T00:00:02Z/2012-08-01T00:00:04Z',
            epoch : '2012-08-01T00:00:02Z',
            cartographicRadians : [0, cartographic3.longitude, cartographic3.latitude, cartographic3.height,
                                   1, cartographic4.longitude, cartographic4.latitude, cartographic4.height,
                                   2, cartographic5.longitude, cartographic5.latitude, cartographic5.height],
            interpolationAlgorithm : 'LINEAR',
            interpolationDegree : 1
        };

    it('getValueRangeCartesian works with single cartesian interval', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianForgetValueRangeCartesian);
        var start = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(0);
        var stop = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(2);
        var result = property.getValueRangeCartesian(start, stop);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual(cartesian0);
        expect(result[1]).toEqual(cartesian1);
        expect(result[2]).toEqual(cartesian2);
    });

    it('getValueRangeCartesian works with a result parameter', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianForgetValueRangeCartesian);

        var start = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(0);
        var stop = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(2);
        var existingCartesian0 = new Cartesian3();
        var existingCartesian1 = new Cartesian3();
        var existingCartesian2 = new Cartesian3();
        var result = [existingCartesian0, existingCartesian1, existingCartesian2, new Cartesian3(), new Cartesian3()];

        var returnedResult = property.getValueRangeCartesian(start, stop, undefined, result);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual(cartesian0);
        expect(result[1]).toEqual(cartesian1);
        expect(result[2]).toEqual(cartesian2);
        expect(returnedResult).toBe(result);
        expect(result[0]).toBe(existingCartesian0);
        expect(result[1]).toBe(existingCartesian1);
        expect(result[2]).toBe(existingCartesian2);
    });

    it('getValueRangeCartesian works with single cartographic interval', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartographicForgetValueRangeCartesian);
        var start = JulianDate.fromIso8601(cartographicForgetValueRangeCartesian.epoch).addSeconds(0);
        var stop = JulianDate.fromIso8601(cartographicForgetValueRangeCartesian.epoch).addSeconds(2);
        var result = property.getValueRangeCartesian(start, stop);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(cartographic3));
        expect(result[1]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(cartographic4));
        expect(result[2]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(cartographic5));
    });

    it('getValueRangeCartesian works across intervals', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianForgetValueRangeCartesian);
        property.processCzmlIntervals(cartographicForgetValueRangeCartesian);

        var start = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(1);
        var stop = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(3);
        var result = property.getValueRangeCartesian(start, stop);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual(cartesian1);
        expect(result[1]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(cartographic3));
        expect(result[2]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(cartographic4));
    });

    it('getValueRangeCartesian works with no data', function() {
        var property = new DynamicPositionProperty();
        var result = property.getValueRangeCartesian(new JulianDate(), new JulianDate());
        expect(result.length).toEqual(0);
    });

    it('getValueRangeCartesian works if requested interval is before any data.', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianForgetValueRangeCartesian);
        var start = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(-10);
        var stop = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(-5);
        var result = property.getValueRangeCartesian(start, stop);
        expect(result.length).toEqual(0);
    });

    it('getValueRangeCartesian works if requested interval is after all data.', function() {
        var property = new DynamicPositionProperty();
        property.processCzmlIntervals(cartesianForgetValueRangeCartesian);
        var start = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(10);
        var stop = JulianDate.fromIso8601(cartesianForgetValueRangeCartesian.epoch).addSeconds(5);
        var result = property.getValueRangeCartesian(start, stop);
        expect(result.length).toEqual(0);
    });

    it('getValueRangeCartesian throws with no start time', function() {
        var property = new DynamicPositionProperty();
        expect(function() {
            property.getValueRangeCartesian(undefined, new JulianDate());
        }).toThrow();
    });

    it('getValueRangeCartesian throws with no stop time', function() {
        var property = new DynamicPositionProperty();
        expect(function() {
            property.getValueRangeCartesian(new JulianDate(), undefined);
        }).toThrow();
    });
});
