function math ()	{
	'use strict';

	var model = {};
	/*
		Number sequence 리스트에서 중간값의 위치를 반환한다.
	 */
	model.medianIndex = function (seqList)	{
		var len = seqList.length;
		// 홀수일 경우 1을 더한 후 2로 나누고 짝수는 그냥 2로 나눈다.
		return len % 2 === 1 ? (len + 1) / 2 : len / 2;
	};
	/*
		Number sequence 리스트에서 중간값을 반환한다.
	 */
	model.median = function (seqList)	{
		var list = bio.objects.clone(seqList);
		// 혹시라도 정렬이 안되어있을 경우를 고려하여 정렬한다.
		return list.sort(function (a, b)	{
						 return a > b ? 1 : -1;
					 })[model.medianIndex(list)];
	};
	/*
		두 수 혹은 숫자 리스트에서 가장 작은 값을 반환한다.
	 */
	model.min = function (v1, v2)	{
		return arguments.length < 2 ? 
					 Math.min.apply(null, v1) : 
					 Math.min.call(null, v1, v2);
	};
	/*
		두 수 혹은 숫자 리스트에서 가장 큰 값을 반환한다.
	 */
	model.max = function (v1, v2)	{
		return arguments.length < 2 ? 
					 Math.max.apply(null, v1) : 
					 Math.max.call(null, v1, v2);
	};
	/*
		Start 부터 End 까지의 범위내의 랜덤 값을 반환하는 함수.
	 */
	model.random = function (start, end)	{
		start = start || 0;
		end = end || 1;

		return Math.floor(Math.random() * end) + start;
	};

	return model;
};