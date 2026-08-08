export const searchTours = async (req, res, next) => {
  try {
    const { term } = req.params;

    if (!term) {
      return next(errorHandler(400, "Search term is required"));
    }

    const numericTerm = parseFloat(term);
    const isNumeric = !isNaN(numericTerm);

    const searchQuery = {
      $or: [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ],
    };

    if (isNumeric) {
      searchQuery.$or.push(
        { price: numericTerm },
        { duration_days: numericTerm }
      );
    }

    const tours = await Tour.find(searchQuery)
      .populate("created_by", "full_name")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};
