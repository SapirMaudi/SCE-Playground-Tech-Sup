import SortDropdown from './SortDropdown';
import FilterOffcanvas from './FilterOffcanvas';
import Search from './Search';

function FilterSortSearch(props) {
  return (
    <>
      <Search
        allProducts={props.allProducts}
        setDisplayedProducts={props.setDisplayedProducts}
        setFilteredProducts={props.setFilteredProducts}
        setLastSearchTerm={props.setLastSearchTerm}
      />
      <FilterOffcanvas
        displayedProducts={props.displayedProducts}
        filteredProducts={props.filteredProducts}
        setFilteredProducts={props.setFilteredProducts}
        isAdmin={props.isAdmin}
        setFiltersOn={props.setFiltersOn}
      />
      {props.filteredProducts.length > 0 ? (
        <SortDropdown
          productsToSort={props.filteredProducts}
          setProductsToSort={props.setFilteredProducts}
          isAdmin={props.isAdmin}
        />
      ) : (
        <SortDropdown
          productsToSort={props.displayedProducts}
          setProductsToSort={props.setDisplayedProducts}
          isAdmin={props.isAdmin}
        />
      )}
    </>
  );
}

export default FilterSortSearch;
